import { WECHAT_CLOUD_ENV_ID } from '@/config/cloud'

let initialized = false

// 获取微信云开发实例。H5 等非微信环境返回 null，调用方需要降级或提示。
export function getWechatCloud() {
  if (typeof wx === 'undefined' || !wx.cloud) return null

  // wx.cloud.init 只允许做一次，这里用模块级状态防止重复初始化。
  if (!initialized) {
    wx.cloud.init({
      env: WECHAT_CLOUD_ENV_ID,
      traceUser: true,
    })
    initialized = true
  }

  return wx.cloud
}

// 获取云数据库实例；目前主要用于房间实时 watch。
export function getWechatCloudDatabase() {
  return getWechatCloud()?.database() ?? null
}
