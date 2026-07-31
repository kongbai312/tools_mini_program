import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const mode = process.argv[2] === 'dev' ? 'dev' : 'build'
const source = resolve(root, 'cloudfunctions')
const target = resolve(root, 'dist', mode, 'mp-weixin', 'cloudfunctions')

// UniApp 不会自动把根目录 cloudfunctions 复制到 dist，这个脚本补齐微信开发者工具所需目录。
if (!existsSync(source)) {
  console.log('[sync-cloudfunctions] skipped: cloudfunctions directory not found')
  process.exit(0)
}

mkdirSync(dirname(target), { recursive: true })
if (!existsSync(target)) {
  mkdirSync(target, { recursive: true })
}
cpSync(source, target, { recursive: true, force: true })

console.log(`[sync-cloudfunctions] copied ${source} -> ${target}`)
