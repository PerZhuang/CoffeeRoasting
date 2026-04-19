import React from 'react'

const BEANS = [
  { id: 'all',    label: '全部',      dot: '#5c5668', filter: null },
  { id: 'yunnan', label: '云南卡蒂姆', dot: '#34d399', filter: 'Catimor' },
  { id: 'panama', label: '巴拿马卡杜艾', dot: '#f0a030', filter: 'Catuai' },
]

function scoreClass(s) {
  const n = parseFloat(s)
  if (!n) return 'score-none'
  if (n >= 8) return 'score-great'
  if (n >= 6) return 'score-ok'
  return 'score-low'
}

function fmtDate(d) {
  if (!d) return ''
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return d
  return `${m[2]}/${m[3]}`
}

export default function RoastList({ roasts, klogs, beanFilter, selectedKlog, onSelect }) {
  // 从 klog 文件名提取编号，匹配 CSV 行
  const items = [...roasts]
    .reverse()
    .filter(r => !beanFilter || r.green_bean?.toLowerCase().includes(beanFilter.toLowerCase()))
    .map(r => {
      const logNum = parseInt(r.roast_id) + 69
      const klog = `log${String(logNum).padStart(4, '0')}`
      const hasKlog = klogs?.includes(klog)
      const devPct = parseFloat(r.dev_pct) || 0
      return { ...r, klog, hasKlog, devPct }
    })

  return (
    <div className="roast-list">
      <div className="roast-list-header">
        炉次记录 · {items.length}
      </div>
      <div className="roast-list-scroll">
        {items.map(r => (
          <div
            key={r.roast_id}
            className={`roast-item ${selectedKlog === r.klog ? 'active' : ''}`}
            onClick={() => r.hasKlog && onSelect(r)}
            style={{ opacity: r.hasKlog ? 1 : 0.45 }}
          >
            <div className="roast-item-top">
              <span className="roast-item-id">
                {r.klog.replace('log0', '#')}
              </span>
              <span className={`roast-item-score ${scoreClass(r.cupping_score)}`}>
                {r.cupping_score ? `★ ${r.cupping_score}` : '—'}
              </span>
            </div>
            <div className="roast-item-mid">
              <span>{fmtDate(r.date)}</span>
              <span className="roast-item-mid-dot">·</span>
              <span>{r.profile_version || '—'}</span>
              {r.actual_fc_temp && r.actual_fc_temp !== 'N/A' && (
                <>
                  <span className="roast-item-mid-dot">·</span>
                  <span style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                    {r.actual_fc_temp}°
                  </span>
                </>
              )}
            </div>
            {r.devPct > 0 && (
              <div className="roast-item-bar">
                <div
                  className="roast-item-bar-fill"
                  style={{ width: `${Math.min(r.devPct / 35 * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export { BEANS }
