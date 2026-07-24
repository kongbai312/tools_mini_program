import { WECHAT_CLOUD_ENV_ID } from '@/config/cloud'

let initialized = false

export function getWechatCloud() {
  if (typeof wx === 'undefined' || !wx.cloud) return null

  if (!initialized) {
    wx.cloud.init({
      env: WECHAT_CLOUD_ENV_ID,
      traceUser: true,
    })
    initialized = true
  }

  return wx.cloud
}

export function getWechatCloudDatabase() {
  return getWechatCloud()?.database() ?? null
}
