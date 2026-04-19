/**
 * 构建前将仓库根目录的数据文件复制到 public/data/
 * 同时生成 public/data/manifest.json 供前端发现文件列表
 */
const fs = require('fs')
const path = require('path')

const repo = path.resolve(__dirname, '../..')
const dest = path.resolve(__dirname, '../public/data')

fs.mkdirSync(dest, { recursive: true })

// 复制目录（跳过符号链接）
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return
  const stat = fs.lstatSync(src)
  if (stat.isSymbolicLink()) return
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry)
    const d = path.join(dst, entry)
    const es = fs.lstatSync(s)
    if (es.isSymbolicLink()) continue
    if (es.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// 复制各数据目录
for (const dir of ['01_green_beans', '03_roast_logs', '04_analysis', '05_cupping']) {
  copyDir(path.join(repo, dir), path.join(dest, dir))
}
fs.copyFileSync(path.join(repo, 'roast_log.csv'), path.join(dest, 'roast_log.csv'))

// 生成 manifest.json
function listFiles(dir, ext) {
  const full = path.join(dest, dir)
  if (!fs.existsSync(full)) return []
  return fs.readdirSync(full)
    .filter(f => f.endsWith(ext) && !f.startsWith('.'))
    .map(f => f.replace(ext, ''))
    .sort()
}

const manifest = {
  klogs:    listFiles('03_roast_logs', '.klog'),
  beans:    listFiles('01_green_beans', '.md'),
  cupping:  listFiles('05_cupping', '.md').filter(f => f !== 'cupping_template'),
  analysis: listFiles('04_analysis', '.md'),
}

fs.writeFileSync(
  path.join(dest, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
)

console.log('✅ Data copied:', JSON.stringify({
  klogs: manifest.klogs.length,
  beans: manifest.beans.length,
  cupping: manifest.cupping.length,
  analysis: manifest.analysis.length,
}))
