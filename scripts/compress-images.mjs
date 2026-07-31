import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '../src/static/imgs')

/** @type {{ file: string; maxWidth: number; quality: number }[]} */
// 只压缩主包静态图，避免误处理分包或源码外图片。
const tasks = [
  { file: 'home-bg.png', maxWidth: 750, quality: 82 },
  { file: 'home_role.png', maxWidth: 400, quality: 85 },
  { file: 'my_bg.png', maxWidth: 750, quality: 82 },
  { file: 'my_role.png', maxWidth: 400, quality: 85 },
  { file: 'discover_role.png', maxWidth: 400, quality: 85 },
  { file: 'test.png', maxWidth: 600, quality: 82 },
  { file: 'tools_role.png', maxWidth: 400, quality: 85 },
]

async function compress(file, opts) {
  const input = path.join(srcDir, file)
  if (!fs.existsSync(input)) {
    console.warn('skip missing:', file)
    return
  }
  const tmp = input + '.tmp.png'
  await sharp(input)
    .resize({ width: opts.maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: opts.quality })
    .toFile(tmp)
  fs.renameSync(tmp, input)
  console.log(`${file}: ${(fs.statSync(input).size / 1024).toFixed(1)}KB`)
}

const discoverDir = path.join(srcDir, 'discover')
if (fs.existsSync(discoverDir)) {
  for (const f of fs.readdirSync(discoverDir)) {
    if (f.endsWith('.png')) {
      tasks.push({ file: `discover/${f}`, maxWidth: 128, quality: 85 })
    }
  }
}

for (const t of tasks) {
  await compress(t.file, t)
}
