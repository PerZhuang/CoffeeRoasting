/**
 * 解析 .klog 文件
 * 返回 { meta, columns, rows, firstCrack }
 */
export function parseKlog(text) {
  const lines = text.split('\n')
  const meta = {}
  let columns = []
  const rows = []
  let dataStarted = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 元数据行（key:value）
    if (!dataStarted && trimmed.includes(':') && !trimmed.startsWith('time')) {
      const idx = trimmed.indexOf(':')
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      meta[key] = val
      continue
    }

    // 列头行
    if (trimmed.startsWith('time\t')) {
      columns = trimmed.split('\t').map(c => c.replace(/[#=^]/g, '').trim())
      dataStarted = true
      continue
    }

    // offsets 行（跳过）
    if (trimmed.startsWith('offsets')) continue

    // 数据行
    if (dataStarted && /^\d/.test(trimmed)) {
      const vals = trimmed.split('\t').map(Number)
      const row = {}
      columns.forEach((col, i) => { row[col] = vals[i] })
      rows.push(row)
    }
  }

  // 识别一爆：actual_ROR 出现急速下降 >40% 后反弹的特征点
  const firstCrack = detectFirstCrack(rows)

  return { meta, columns, rows, firstCrack }
}

/**
 * 一爆检测：在高温阶段找 ROR 最大跌幅点
 * 条件：temp > 170°C，ROR 从前5点均值下跌 > 35%
 */
function detectFirstCrack(rows) {
  const WINDOW = 5
  for (let i = WINDOW + 2; i < rows.length - 3; i++) {
    const temp = rows[i].mean_temp
    if (!temp || temp < 170) continue

    const prevAvg = rows.slice(i - WINDOW, i).reduce((s, r) => s + (r.actual_ROR || 0), 0) / WINDOW
    const curr = rows[i].actual_ROR || 0
    if (prevAvg > 5 && curr < prevAvg * 0.6) {
      return { time: rows[i].time, temp, ror: curr }
    }
  }
  return null
}

/**
 * 从 klog 元数据提取摘要信息
 */
export function extractMeta(meta) {
  return {
    date:         meta.roast_date || '',
    profileName:  meta.profile_short_name || meta.profile_file_name || '',
    level:        parseFloat(meta.roasting_level) || null,
    expectFc:     parseFloat(meta.expect_fc) || null,
    model:        meta.model || '',
  }
}
