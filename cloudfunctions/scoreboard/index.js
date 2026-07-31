const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const ROOMS = 'score_rooms'
const MEMBERS = 'score_room_members'
const MAX_PLAYERS = 50
const MAX_RECORDS = 100
const COLORS = ['#2F80ED', '#27AE60', '#EB5757', '#F2994A', '#9B51E0', '#00A8A8']

// scoreboard 是计分器唯一云函数入口，前端通过 action 区分具体操作。
function ok(data) {
  return { ok: true, data }
}

function fail(message) {
  return { ok: false, message }
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function roomIdFor(roomNo) {
  return `score_room_${roomNo}`
}

function normalizeName(value, fallback) {
  const name = String(value || '').trim().slice(0, 12)
  return name || fallback
}

function normalizeType(value) {
  return value === 'mahjong' ? 'mahjong' : 'general'
}

function defaultPlayers(type) {
  const names = type === 'mahjong'
    ? ['东', '南', '西', '北']
    : ['玩家 1', '玩家 2']
  return names.map((name, index) => ({
    id: uid('player'),
    name,
    score: 0,
    color: COLORS[index % COLORS.length],
    memberKey: '',
  }))
}

// 房间内玩家昵称和成员昵称分开维护，这里只改 players.name。
function renameScorePlayer(players, playerId, name) {
  const value = normalizeName(name, '')
  if (!value || !Array.isArray(players)) return players
  return players.map((player) => (
    player.id === playerId
      ? { ...player, name: value }
      : player
  ))
}

// 绑定成员到指定空座；目标座位已有其他成员时不会改动。
function assignMemberToPlayer(players, memberKey, playerId) {
  if (!canUsePlayerSeat(players, memberKey, playerId)) return players
  return players.map((player) => {
    if (player.id === playerId) return { ...player, memberKey }
    if (player.memberKey === memberKey) {
      const next = { ...player }
      delete next.memberKey
      return next
    }
    return player
  })
}

// 换座只能换到空座，或者保持自己当前占用的座位。
function canUsePlayerSeat(players, memberKey, playerId) {
  if (!memberKey || !playerId || !Array.isArray(players)) return false
  const target = players.find((player) => player.id === playerId)
  if (!target) return false
  return !target.memberKey || target.memberKey === memberKey
}

// 房主可管理所有占位；被授权成员只能管理自己的占位。
function canManageSeat(role, actorMemberKey, targetMemberKey, canChangeSeat = false) {
  if (role === 'owner') return true
  return Boolean(canChangeSeat && actorMemberKey && actorMemberKey === targetMemberKey)
}

// 删除成员或移出占位时清掉玩家座位上的 memberKey。
function clearMemberPlayerBinding(players, memberKey) {
  if (!memberKey || !Array.isArray(players)) return players
  return players.map((player) => {
    if (player.memberKey !== memberKey) return player
    const next = { ...player }
    delete next.memberKey
    return next
  })
}

// 云端最终记分校验，防止前端绕过规则直接调用云函数。
function validateChanges(type, changes, playerIds) {
  if (!Array.isArray(changes) || !changes.length) return '请至少修改一位玩家的分数'
  const seen = new Set()
  let total = 0
  for (const item of changes) {
    if (!item || !playerIds.has(item.playerId) || seen.has(item.playerId)) return '玩家或分数变动无效'
    const delta = Number(item.delta)
    if (!Number.isFinite(delta) || delta === 0) return '玩家或分数变动无效'
    seen.add(item.playerId)
    total += delta
  }
  if (type === 'mahjong' && total !== 0) return '麻将计分的本局总分必须为 0'
  return ''
}

// 根据 changes 生成新的玩家分数列表。
function applyChanges(players, changes) {
  const map = new Map(changes.map((item) => [item.playerId, Number(item.delta)]))
  return players.map((player) => ({
    ...player,
    score: Number(player.score || 0) + (map.get(player.id) || 0),
  }))
}

// 撤销记录时写入一条反向记录，同时标记原记录已撤销。
function inverseChanges(changes) {
  return changes.map((item) => ({
    playerId: item.playerId,
    delta: -Number(item.delta),
  }))
}

// 从房间号读取房间文档，房间号和文档 id 是固定映射关系。
async function getRoom(roomNo) {
  try {
    const result = await db.collection(ROOMS).doc(roomIdFor(roomNo)).get()
    return result.data
  } catch {
    throw new Error('房间不存在')
  }
}

function ensureActiveRoom(room) {
  if (room.status !== 'active') throw new Error('房间已删除或已结束')
}

// 根据 openid 查当前用户在房间里的成员身份。
async function getMembership(roomId, openid) {
  const result = await db.collection(MEMBERS).where({
    roomId,
    _openid: openid,
  }).limit(1).get()
  return result.data[0] || null
}

function currentMember(room, membership) {
  return room.members.find((item) => item.memberKey === membership.memberKey) || null
}

// 返回给前端的 session 只包含当前房间和当前成员身份。
function buildSession(room, member) {
  return {
    room,
    member: {
      memberKey: member.memberKey,
      name: member.name,
      role: member.role,
      canChangeSeat: Boolean(member.canChangeSeat),
      joinedAt: member.joinedAt,
    },
  }
}

async function ensureMemberPlayerBinding(room, member) {
  return room
}

function canEdit(role) {
  return role === 'owner' || role === 'scorer'
}

function canUndo(role, memberKey, record) {
  if (record.undoneAt) return false
  return role === 'owner' || (role === 'scorer' && record.actorMemberKey === memberKey)
}

// 创建房间时同时写 score_rooms 和 score_room_members。
async function createRoom(event, openid) {
  const type = normalizeType(event.type)
  const ownerName = normalizeName(event.nickname, '房主')
  let roomNo = ''
  let roomId = ''

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000))
    const candidateId = roomIdFor(candidate)
    try {
      await db.collection(ROOMS).doc(candidateId).get()
    } catch {
      roomNo = candidate
      roomId = candidateId
      break
    }
  }
  if (!roomNo) throw new Error('房间号生成失败，请重试')

  const now = Date.now()
  const member = {
    memberKey: uid('member'),
    name: ownerName,
    role: 'owner',
    canChangeSeat: true,
    joinedAt: now,
  }
  const room = {
    _id: roomId,
    roomNo,
    title: type === 'mahjong' ? '麻将记分' : '实时计分',
    type,
    ownerMemberKey: member.memberKey,
    players: defaultPlayers(type),
    members: [member],
    records: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
  }

  const { _id, ...roomData } = room
  await db.collection(ROOMS).doc(roomId).set({ data: roomData })
  await db.collection(MEMBERS).add({
    data: {
      roomId,
      roomNo,
      _openid: openid,
      ...member,
    },
  })
  return buildSession(room, member)
}

// 加入房间只创建/更新成员身份，不自动占用玩家座位。
async function joinRoom(event, openid) {
  const roomNo = String(event.roomNo || '').trim()
  if (!/^\d{6}$/.test(roomNo)) throw new Error('请输入 6 位房间号')
  const room = await getRoom(roomNo)
  ensureActiveRoom(room)
  const existing = await getMembership(room._id, openid)
  if (existing) {
    const current = currentMember(room, existing) || existing
    const nextName = normalizeName(event.nickname, current.name)
    const member = { ...current, name: nextName }
    const nameChanged = member.name !== current.name || member.name !== existing.name
    const members = room.members.map((item) => (
      item.memberKey === member.memberKey ? member : item
    ))
    const shouldUpdateRoom = nameChanged
    const now = Date.now()
    const updatedRoom = shouldUpdateRoom
      ? { ...room, members, updatedAt: now }
      : room

    if (shouldUpdateRoom) {
      await db.collection(ROOMS).doc(room._id).update({
        data: { members, updatedAt: now },
      })
      if (member.name !== existing.name && existing._id) {
        await db.collection(MEMBERS).doc(existing._id).update({ data: { name: member.name } })
      }
    }
    return buildSession(updatedRoom, member)
  }

  const now = Date.now()
  const member = {
    memberKey: uid('member'),
    name: normalizeName(event.nickname, `访客 ${room.members.length + 1}`),
    role: 'viewer',
    canChangeSeat: false,
    joinedAt: now,
  }
  const members = [...room.members, member]
  const updatedRoom = { ...room, members, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({
    data: { members, updatedAt: now },
  })
  await db.collection(MEMBERS).add({
    data: {
      roomId: room._id,
      roomNo,
      _openid: openid,
      ...member,
    },
  })
  return buildSession(updatedRoom, member)
}

// 后续所有需要房间身份的 action 都先通过这里校验成员关系。
async function requireSession(roomNo, openid) {
  const room = await getRoom(roomNo)
  ensureActiveRoom(room)
  const membership = await getMembership(room._id, openid)
  if (!membership) throw new Error('请先通过房间号加入该房间')
  const member = currentMember(room, membership)
  if (!member) throw new Error('房间成员信息异常')
  return { room, member }
}

// 房主入口列表：通过成员表找到自己拥有的房间，再回查活跃房间。
async function listOwnedRooms(openid) {
  const memberships = await db.collection(MEMBERS).where({
    _openid: openid,
    role: 'owner',
  }).limit(100).get()
  const ownerMemberKeys = new Set(memberships.data.map((item) => item.memberKey))
  if (!ownerMemberKeys.size) return []

  const roomsResult = await db.collection(ROOMS).where({
    status: 'active',
  }).limit(100).get()

  return roomsResult.data
    .filter((room) => ownerMemberKeys.has(room.ownerMemberKey))
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .map((room) => ({
      _id: room._id,
      roomNo: room.roomNo,
      title: room.title,
      type: room.type,
      playersCount: Array.isArray(room.players) ? room.players.length : 0,
      recordsCount: Array.isArray(room.records) ? room.records.length : 0,
      updatedAt: room.updatedAt || 0,
      createdAt: room.createdAt || 0,
    }))
}

// 软删除房间，保留历史数据但不再允许进入。
async function deleteRoom(event, openid) {
  const roomNo = String(event.roomNo || '').trim()
  const { room, member } = await requireSession(roomNo, openid)
  if (member.role !== 'owner') throw new Error('只有房主可以删除房间')

  const now = Date.now()
  await db.collection(ROOMS).doc(room._id).update({
    data: {
      status: 'closed',
      deletedAt: now,
      deletedByMemberKey: member.memberKey,
      updatedAt: now,
    },
  })
  return { roomNo }
}

async function getRoomSession(event, openid) {
  return requireSession(String(event.roomNo || '').trim(), openid)
}

// 房主开关成员的记分权限。
async function updateMemberRole(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以管理权限')

  const targetMemberKey = String(event.memberKey || '')
  const role = event.role === 'scorer' ? 'scorer' : 'viewer'
  const target = room.members.find((item) => item.memberKey === targetMemberKey)
  if (!target || target.memberKey === room.ownerMemberKey) throw new Error('该成员不能修改权限')

  const now = Date.now()
  const members = room.members.map((item) => (
    item.memberKey === targetMemberKey ? { ...item, role } : item
  ))
  const query = await db.collection(MEMBERS).where({
    roomId: room._id,
    memberKey: targetMemberKey,
  }).limit(1).get()
  const targetDoc = query.data[0]
  if (!targetDoc?._id) throw new Error('成员不存在')
  await db.collection(MEMBERS).doc(targetDoc._id).update({ data: { role } })
  await db.collection(ROOMS).doc(room._id).update({
    data: { members, updatedAt: now },
  })
  return buildSession({ ...room, members, updatedAt: now }, { ...member })
}

// 房主开关成员“可换座”权限，独立于记分权限。
async function updateMemberSeatPermission(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以管理换座权限')

  const targetMemberKey = String(event.memberKey || '')
  const target = room.members.find((item) => item.memberKey === targetMemberKey)
  if (!target || target.memberKey === room.ownerMemberKey) throw new Error('该成员不能修改换座权限')

  const canChangeSeat = Boolean(event.canChangeSeat)
  const now = Date.now()
  const members = room.members.map((item) => (
    item.memberKey === targetMemberKey ? { ...item, canChangeSeat } : item
  ))
  const query = await db.collection(MEMBERS).where({
    roomId: room._id,
    memberKey: targetMemberKey,
  }).limit(1).get()
  const targetDoc = query.data[0]
  if (!targetDoc?._id) throw new Error('成员不存在')
  await db.collection(MEMBERS).doc(targetDoc._id).update({ data: { canChangeSeat } })
  await db.collection(ROOMS).doc(room._id).update({
    data: { members, updatedAt: now },
  })
  return buildSession({ ...room, members, updatedAt: now }, { ...member })
}

// 换座/占位：房主可操作所有人，成员只能在授权后操作自己。
async function bindMemberToPlayer(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)

  const targetMemberKey = String(event.memberKey || '')
  const playerId = String(event.playerId || '')
  const target = room.members.find((item) => item.memberKey === targetMemberKey)
  if (!target) throw new Error('成员不存在')
  if (!canManageSeat(member.role, member.memberKey, targetMemberKey, member.canChangeSeat)) {
    throw new Error('没有换座权限')
  }
  const targetPlayer = room.players.find((player) => player.id === playerId)
  if (!targetPlayer) throw new Error('座位不存在')
  if (targetPlayer.memberKey && targetPlayer.memberKey !== targetMemberKey) {
    throw new Error('该座位已有人占位')
  }

  const players = assignMemberToPlayer(room.players, targetMemberKey, playerId)
  const now = Date.now()
  const updatedRoom = { ...room, players, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

// 只有房主可以把成员从座位移出。
async function unbindMemberFromPlayer(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以管理占位')

  const targetMemberKey = String(event.memberKey || '')
  const players = clearMemberPlayerBinding(room.players, targetMemberKey)
  const now = Date.now()
  const updatedRoom = { ...room, players, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

// 删除房间成员，同时清理他占用的座位。
async function removeMember(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以删除成员')

  const targetMemberKey = String(event.memberKey || '')
  if (!targetMemberKey || targetMemberKey === room.ownerMemberKey) throw new Error('房主不能删除')
  const target = room.members.find((item) => item.memberKey === targetMemberKey)
  if (!target) throw new Error('成员不存在')

  const members = room.members.filter((item) => item.memberKey !== targetMemberKey)
  const players = clearMemberPlayerBinding(room.players, targetMemberKey)
  const now = Date.now()
  const query = await db.collection(MEMBERS).where({
    roomId: room._id,
    memberKey: targetMemberKey,
  }).limit(1).get()
  const targetDoc = query.data[0]
  if (targetDoc?._id) {
    await db.collection(MEMBERS).doc(targetDoc._id).remove()
  }
  const updatedRoom = { ...room, members, players, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({
    data: { members, players, updatedAt: now },
  })
  return buildSession(updatedRoom, member)
}

// 房主批量更新玩家列表，新增玩家时保留已有分数和绑定关系。
async function updatePlayers(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以管理玩家')
  if (!Array.isArray(event.players) || event.players.length < 1 || event.players.length > MAX_PLAYERS) {
    throw new Error('玩家数量需要在 1 到 50 人之间')
  }

  const existing = new Map(room.players.map((player) => [player.id, player]))
  const ids = new Set()
  const players = event.players.map((item, index) => {
    const id = String(item.id || '')
    if (!id || ids.has(id)) throw new Error('玩家信息无效')
    ids.add(id)
    const old = existing.get(id)
    return {
      id,
      name: normalizeName(item.name, `玩家 ${index + 1}`),
      score: old ? old.score : Number(item.score || 0),
      color: String(item.color || old?.color || COLORS[index % COLORS.length]),
      memberKey: String(old?.memberKey || item.memberKey || ''),
    }
  })

  const now = Date.now()
  const updatedRoom = { ...room, players, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

// 房主修改玩家/座位昵称，不影响成员昵称。
async function updatePlayerName(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (member.role !== 'owner') throw new Error('只有房主可以修改玩家昵称')

  const playerId = String(event.playerId || '')
  const players = renameScorePlayer(room.players, playerId, event.name)
  if (players === room.players) throw new Error('请输入玩家昵称')

  const now = Date.now()
  const updatedRoom = { ...room, players, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

// 记分员或房主提交一条计分记录。
async function addRecord(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  if (!canEdit(member.role)) throw new Error('房主授权后才能记分')
  if (room.status !== 'active') throw new Error('房间已结束')

  const changes = Array.isArray(event.changes)
    ? event.changes.map((item) => ({ playerId: String(item.playerId || ''), delta: Number(item.delta) }))
    : []
  const validation = validateChanges(room.type, changes, new Set(room.players.map((item) => item.id)))
  if (validation) throw new Error(validation)

  const winnerPlayerId = String(event.winnerPlayerId || '')
  const winnerPlayer = winnerPlayerId
    ? room.players.find((player) => player.id === winnerPlayerId)
    : null
  if (winnerPlayerId && !winnerPlayer) throw new Error('赢家不存在')

  const now = Date.now()
  const record = {
    id: uid('record'),
    type: 'score',
    actorMemberKey: member.memberKey,
    actorName: member.name,
    changes,
    note: String(event.note || '').trim().slice(0, 30),
    winnerPlayerId: winnerPlayer?.id || '',
    winnerPlayerName: winnerPlayer?.name || '',
    createdAt: now,
    undoneAt: 0,
  }
  const players = applyChanges(room.players, changes)
  const records = [record, ...room.records].slice(0, MAX_RECORDS)
  const updatedRoom = { ...room, players, records, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, records, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

// 撤销记录会生成一条 undo 记录，并把原记录标记 undoneAt。
async function undoRecord(event, openid) {
  const { room, member } = await requireSession(String(event.roomNo || '').trim(), openid)
  const target = room.records.find((item) => item.id === String(event.recordId || ''))
  if (!target) throw new Error('记录不存在')
  if (!canUndo(member.role, member.memberKey, target)) throw new Error('没有权限撤销这条记录')

  const now = Date.now()
  const changes = inverseChanges(target.changes)
  const undoRecord = {
    id: uid('undo'),
    type: 'undo',
    actorMemberKey: member.memberKey,
    actorName: member.name,
    changes,
    note: `撤销 ${target.actorName} 的记分`,
    sourceRecordId: target.id,
    createdAt: now,
    undoneAt: 0,
  }
  const records = [
    undoRecord,
    ...room.records.map((item) => (
      item.id === target.id
        ? { ...item, undoneAt: now, undoneByName: member.name }
        : item
    )),
  ].slice(0, MAX_RECORDS)
  const players = applyChanges(room.players, changes)
  const updatedRoom = { ...room, players, records, updatedAt: now }
  await db.collection(ROOMS).doc(room._id).update({ data: { players, records, updatedAt: now } })
  return buildSession(updatedRoom, member)
}

exports.main = async (event) => {
  try {
    const action = event.action
    const { OPENID: openid } = cloud.getWXContext()
    if (!openid) return fail('未获取到微信用户身份')

    if (action === 'createRoom') return ok(await createRoom(event, openid))
    if (action === 'listOwnedRooms') return ok(await listOwnedRooms(openid))
    if (action === 'joinRoom') return ok(await joinRoom(event, openid))
    if (action === 'getRoom') return ok(await getRoomSession(event, openid))
    if (action === 'updateMemberRole') return ok(await updateMemberRole(event, openid))
    if (action === 'updateMemberSeatPermission') return ok(await updateMemberSeatPermission(event, openid))
    if (action === 'bindMemberToPlayer') return ok(await bindMemberToPlayer(event, openid))
    if (action === 'unbindMemberFromPlayer') return ok(await unbindMemberFromPlayer(event, openid))
    if (action === 'removeMember') return ok(await removeMember(event, openid))
    if (action === 'updatePlayers') return ok(await updatePlayers(event, openid))
    if (action === 'updatePlayerName') return ok(await updatePlayerName(event, openid))
    if (action === 'addRecord') return ok(await addRecord(event, openid))
    if (action === 'undoRecord') return ok(await undoRecord(event, openid))
    if (action === 'deleteRoom') return ok(await deleteRoom(event, openid))
    return fail('未知操作')
  } catch (error) {
    return fail(error instanceof Error ? error.message : '服务异常')
  }
}
