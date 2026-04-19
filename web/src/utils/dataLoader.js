import Papa from 'papaparse'

const BASE = '/data'

/** 获取文件列表 manifest */
export async function loadManifest() {
  const res = await fetch(`${BASE}/manifest.json`)
  return res.json()
}

/** 加载并解析 roast_log.csv */
export async function loadRoastLog() {
  const res = await fetch(`${BASE}/roast_log.csv`)
  const text = await res.text()
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
  return data
}

/** 加载单个 .klog 文件原始文本 */
export async function loadKlog(name) {
  const res = await fetch(`${BASE}/03_roast_logs/${name}.klog`)
  if (!res.ok) throw new Error(`klog not found: ${name}`)
  return res.text()
}

/** 加载 markdown 文件 */
export async function loadMarkdown(path) {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) return null
  return res.text()
}

/** 加载生豆信息卡 */
export async function loadBeanCard(name) {
  return loadMarkdown(`01_green_beans/${name}.md`)
}

/** 加载杯测记录 */
export async function loadCupping(name) {
  return loadMarkdown(`05_cupping/${name}.md`)
}

/** 加载分析报告 */
export async function loadAnalysis(name) {
  return loadMarkdown(`04_analysis/${name}.md`)
}

/** 格式化 klog 日期为 YYYY-MM-DD */
export function formatKlogDate(roastDate) {
  if (!roastDate) return ''
  // e.g. "10/03/2026 12:48:38 UTC"
  const m = roastDate.match(/(\d+)\/(\d+)\/(\d{4})/)
  if (!m) return roastDate
  const [, day, month, year] = m
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}
