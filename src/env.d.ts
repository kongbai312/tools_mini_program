/// <reference types="vite/client" />

declare module 'uview-plus'

interface WechatCloudQueryResult<T = unknown> {
  data: T[]
}

interface WechatCloudCollection {
  where(query: Record<string, unknown>): WechatCloudCollection
  limit(count: number): WechatCloudCollection
  get(): Promise<WechatCloudQueryResult>
  add(options: { data: Record<string, unknown> }): Promise<{ _id: string }>
  doc(id: string): {
    update(options: { data: Record<string, unknown> }): Promise<unknown>
  }
}

interface WechatCloudDatabase {
  collection(name: string): WechatCloudCollection
}

interface WechatCloudApi {
  init(options: { env: string; traceUser?: boolean }): void
  database(): WechatCloudDatabase
}

declare const wx:
  | {
      cloud?: WechatCloudApi
    }
  | undefined

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
