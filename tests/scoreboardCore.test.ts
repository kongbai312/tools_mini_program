import {
  applyScoreChanges,
  assignMemberToPlayer,
  buildFastSettlementChanges,
  buildScoreboardLeaderboard,
  buildPlayerRecordStats,
  canManageSeat,
  canUsePlayerSeat,
  canUndoScoreRecord,
  clearMemberPlayerBinding,
  filterOwnedActiveRooms,
  inverseScoreChanges,
  renameScorePlayer,
  signedScoreDelta,
  upsertRecentScoreRoom,
  validateScoreChanges,
  type ScorePlayer,
  type ScoreRecord,
} from '../src/utils/scoreboardCore'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const players: ScorePlayer[] = [
  { id: 'p1', name: '东', score: 100, color: '#5B7FFF' },
  { id: 'p2', name: '南', score: 100, color: '#10B981' },
]

const record: ScoreRecord = {
  id: 'r1',
  actorMemberKey: 'member-a',
  actorName: '张三',
  changes: [
    { playerId: 'p1', delta: 10 },
    { playerId: 'p2', delta: -10 },
  ],
  createdAt: 1,
  undoneAt: 0,
}

const updated = applyScoreChanges(players, record.changes)
assert(updated[0].score === 110, 'should add score to the target player')
assert(updated[1].score === 90, 'should subtract score from the target player')

const inverse = inverseScoreChanges(record.changes)
assert(inverse[0].delta === -10 && inverse[1].delta === 10, 'should create inverse changes')

assert(signedScoreDelta('plus', '12') === 12, 'plus sign should keep score delta positive')
assert(signedScoreDelta('minus', '12') === -12, 'minus sign should turn score delta negative')
assert(signedScoreDelta('minus', '') === 0, 'empty score input should create zero delta')
assert(signedScoreDelta('plus', '12abc') === 12, 'score input should ignore non-digit characters')

assert(
  validateScoreChanges('mahjong', record.changes) === null,
  'mahjong changes with a zero sum should be valid',
)
assert(
  validateScoreChanges('mahjong', [{ playerId: 'p1', delta: 10 }]) !== null,
  'mahjong changes with a non-zero sum should be rejected',
)

const fastSettlement = buildFastSettlementChanges(
  [
    { id: 'p1', name: 'player 1', score: 0, color: '#111' },
    { id: 'p2', name: 'player 2', score: 0, color: '#222' },
    { id: 'p3', name: 'player 3', score: 0, color: '#333' },
    { id: 'p4', name: 'player 4', score: 0, color: '#444' },
  ],
  'p1',
  6,
  2,
)
assert(
  fastSettlement.map((item) => item.delta).join(',') === '6,-2,-2,-2',
  'should apply fixed winner and loser scores to every player',
)
assert(
  validateScoreChanges('mahjong', fastSettlement) === null,
  'four-player fast settlement should remain balanced when 6 is split into three losses of 2',
)
assert(
  buildFastSettlementChanges(players, 'missing', 6, 2).length === 0,
  'should reject a fast settlement when the winner is not in the room',
)

const recordStats = buildPlayerRecordStats(
  [
    { id: 'p1', name: 'player 1', score: 0, color: '#111' },
    { id: 'p2', name: 'player 2', score: 0, color: '#222' },
    { id: 'p3', name: 'player 3', score: 0, color: '#333' },
  ],
  [
    {
      id: 'win-1',
      actorMemberKey: 'member-a',
      actorName: '张三',
      changes: [
        { playerId: 'p1', delta: 6 },
        { playerId: 'p2', delta: -3 },
        { playerId: 'p3', delta: -3 },
      ],
      createdAt: 1,
      undoneAt: 0,
      winnerPlayerId: 'p1',
    },
    {
      id: 'win-2',
      actorMemberKey: 'member-a',
      actorName: '张三',
      changes: [
        { playerId: 'p2', delta: 6 },
        { playerId: 'p1', delta: -6 },
      ],
      createdAt: 2,
      undoneAt: 0,
      winnerPlayerId: 'p2',
    },
    {
      id: 'win-3',
      actorMemberKey: 'member-a',
      actorName: '张三',
      changes: [
        { playerId: 'p3', delta: 2 },
        { playerId: 'p1', delta: 2 },
        { playerId: 'p2', delta: -4 },
      ],
      createdAt: 3,
      undoneAt: 0,
      winnerPlayerId: 'p3',
    },
    {
      id: 'manual-score',
      actorMemberKey: 'member-a',
      actorName: '张三',
      changes: [{ playerId: 'p3', delta: 5 }],
      createdAt: 4,
      undoneAt: 0,
    },
    {
      id: 'undone-win',
      actorMemberKey: 'member-a',
      actorName: '张三',
      changes: [
        { playerId: 'p3', delta: 6 },
        { playerId: 'p1', delta: -6 },
      ],
      createdAt: 5,
      undoneAt: 6,
      winnerPlayerId: 'p3',
    },
  ],
)
assert(recordStats.p1.wins === 1, 'winner records should count as wins')
assert(recordStats.p1.losses === 2, 'non-winners should count as losses even when their score delta is positive')
assert(recordStats.p1.winRate === 33, 'win rate should be rounded from wins over total games')
assert(recordStats.p2.wins === 1 && recordStats.p2.losses === 2, 'players can have both wins and losses')
assert(recordStats.p3.wins === 1 && recordStats.p3.losses === 2, 'all non-winners should count as losses while manual and undone records should not count')

const leaderboard = buildScoreboardLeaderboard([
  {
    roomNo: '100001',
    title: 'room 1',
    type: 'mahjong',
    players: [
      { id: 'p1', name: '艺', score: 13, color: '#111' },
      { id: 'p2', name: '南', score: -4, color: '#222' },
      { id: 'p3', name: '西', score: -8, color: '#333' },
    ],
    records: [
      {
        id: 'r1',
        actorMemberKey: 'member-a',
        actorName: '张三',
        changes: [
          { playerId: 'p1', delta: 6 },
          { playerId: 'p2', delta: -3 },
          { playerId: 'p3', delta: -3 },
        ],
        createdAt: 1,
        undoneAt: 0,
        winnerPlayerId: 'p1',
      },
    ],
  },
  {
    roomNo: '100002',
    title: 'room 2',
    type: 'mahjong',
    players: [
      { id: 'a1', name: '艺', score: -2, color: '#444' },
      { id: 'a2', name: '北', score: 10, color: '#555' },
    ],
    records: [
      {
        id: 'r2',
        actorMemberKey: 'member-a',
        actorName: '张三',
        changes: [
          { playerId: 'a2', delta: 6 },
          { playerId: 'a1', delta: -6 },
        ],
        createdAt: 2,
        undoneAt: 0,
        winnerPlayerId: 'a2',
      },
    ],
  },
])
assert(leaderboard.length === 4, 'same-name players should be merged into one leaderboard row')
assert(leaderboard[0].name === '艺', 'leaderboard should sort by total score first')
assert(leaderboard[0].score === 11, 'merged player should sum scores across rooms')
assert(leaderboard[0].roomCount === 2, 'merged player should count selected rooms')
assert(leaderboard[0].wins === 1 && leaderboard[0].losses === 1, 'merged player should sum win/loss games')
assert(leaderboard[0].winRate === 50, 'merged player should calculate win rate from total wins and losses')
assert(leaderboard[1].name === '北', 'score tie should sort before lower scores')

assert(
  canUndoScoreRecord('owner', 'member-b', record),
  'owner should undo any score record',
)
assert(
  canUndoScoreRecord('scorer', 'member-a', record),
  'scorer should undo their own score record',
)
assert(
  !canUndoScoreRecord('scorer', 'member-b', record),
  'scorer should not undo another member score record',
)
assert(
  !canUndoScoreRecord('viewer', 'member-a', record),
  'viewer should not undo score records',
)

const ownedRooms = filterOwnedActiveRooms(
  [
    { roomNo: '100001', ownerMemberKey: 'member-a', status: 'active', updatedAt: 3 },
    { roomNo: '100002', ownerMemberKey: 'member-b', status: 'active', updatedAt: 4 },
    { roomNo: '100003', ownerMemberKey: 'member-a', status: 'closed', updatedAt: 5 },
    { roomNo: '100004', ownerMemberKey: 'member-a', status: 'active', updatedAt: 6 },
  ],
  'member-a',
)
assert(ownedRooms.length === 2, 'should keep only owned active rooms')
assert(ownedRooms[0].roomNo === '100004', 'should sort owned active rooms by updated time desc')

const recentRooms = upsertRecentScoreRoom(
  [
    { roomNo: '100001', title: 'old', type: 'mahjong', playersCount: 4, updatedAt: 1, visitedAt: 1 },
    { roomNo: '100002', title: 'other', type: 'general', playersCount: 2, updatedAt: 2, visitedAt: 2 },
  ],
  { roomNo: '100001', title: 'new', type: 'mahjong', playersCount: 4, updatedAt: 3, visitedAt: 3 },
)
assert(recentRooms.length === 2, 'should dedupe recent rooms by room number')
assert(recentRooms[0].roomNo === '100001', 'should move latest visited room to the top')
assert(recentRooms[0].title === 'new', 'should refresh recent room metadata')

const cappedRecentRooms = Array.from({ length: 12 }, (_, index) => ({
  roomNo: `${100000 + index}`,
  title: `room ${index}`,
  type: 'mahjong' as const,
  playersCount: 4,
  updatedAt: index,
  visitedAt: index,
}))
assert(upsertRecentScoreRoom(cappedRecentRooms, cappedRecentRooms[0]).length === 10, 'should cap recent rooms at 10')

const boundPlayers = assignMemberToPlayer(
  [
    { id: 'p1', name: 'seat 1', score: 0, color: '#111', memberKey: 'm1' },
    { id: 'p2', name: 'seat 2', score: 0, color: '#222' },
  ],
  'm2',
  'p2',
)
assert(boundPlayers[1].memberKey === 'm2', 'should bind member to selected player slot')
assert(boundPlayers[1].name === 'seat 2', 'should not copy member nickname into player name')

const movedPlayers = assignMemberToPlayer(boundPlayers, 'm2', 'p1')
assert(movedPlayers[0].memberKey === 'm1', 'should not move member binding to occupied slot')
assert(movedPlayers[1].memberKey === 'm2', 'should keep current binding when target slot is occupied')

const emptySeatPlayers = assignMemberToPlayer(boundPlayers, 'm2', 'p3')
assert(emptySeatPlayers === boundPlayers, 'should keep bindings unchanged when target slot does not exist')

const movedToEmptyPlayers = assignMemberToPlayer(
  [
    ...boundPlayers,
    { id: 'p3', name: 'seat 3', score: 0, color: '#333' },
  ],
  'm2',
  'p3',
)
assert(movedToEmptyPlayers[2].memberKey === 'm2', 'should move member binding to empty slot')
assert(!movedToEmptyPlayers[1].memberKey, 'should clear previous slot when moving to empty slot')

assert(canUsePlayerSeat(boundPlayers, 'm2', 'p2'), 'should allow keeping the current occupied slot')
assert(!canUsePlayerSeat(boundPlayers, 'm2', 'p1'), 'should reject a slot occupied by another member')
assert(canManageSeat('owner', 'owner-member', 'm2'), 'owner should manage any member seat')
assert(canManageSeat('viewer', 'm2', 'm2', true), 'authorized member should manage their own seat')
assert(!canManageSeat('viewer', 'm2', 'm1', true), 'authorized member should not manage another member seat')
assert(!canManageSeat('viewer', 'm2', 'm2', false), 'viewer without seat permission should not manage seats')

const renamedPlayers = renameScorePlayer(boundPlayers, 'p2', 'Bob')
assert(renamedPlayers[1].name === 'Bob', 'should rename target score player')
assert(renamedPlayers[0].name === 'seat 1', 'should not rename other score players')

const clearedPlayers = clearMemberPlayerBinding(renamedPlayers, 'm2')
assert(!clearedPlayers[1].memberKey, 'should clear player binding for removed member')

console.log('scoreboard core tests passed')
