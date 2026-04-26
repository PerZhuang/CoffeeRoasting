import React, { useState, useMemo } from 'react'
import NxNav from '../components/NxNav.jsx'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'

const COLS = [
  { id: 'date',    label: '日期' },
  { id: 'bean',    label: '豆种' },
  { id: 'version', label: '版本' },
  { id: 'fc',      label: '一爆℃' },
  { id: 'dev',     label: '发展比' },
  { id: 'end',     label: '出豆℃' },
  { id: 'loss',    label: '失重' },
  { id: 'score',   label: '杯测' },
]

function scoreColor(s) {
  const n = parseFloat(s)
  if (!n) return '#737373'
  if (n >= 8) return '#1ed760'
  if (n >= 6) return '#f0a030'
  return '#e50914'
}

export default function RoastsPage({ roasts, beans, page, onNavigate, onSelectBean }) {
  const [sort, setSort] = useState({ col: 'date', dir: -1 })
  const [beanFilter, setBeanFilter] = useState('all')

  const beanMap = useMemo(() => {
    const m = {}
    beans.forEach(b => { m[b.filterKey.toLowerCase()] = b })
    return m
  }, [beans])

  const enriched = useMemo(() =>
    roasts.map(r => {
      const key = Object.keys(beanMap).find(k =>
        r.green_bean?.toLowerCase().includes(k)
      )
      const b = key ? beanMap[key] : null
      const vis = b ? (beanPoster[b.id] || FALLBACK_POSTER) : FALLBACK_POSTER
      return { ...r, _bean: b, _vis: vis }
    }), [roasts, beanMap])

  const FILTERS = [
    { id: 'all', label: '全部' },
    ...beans.map(b => ({ id: b.id, label: b.name.slice(0, 4) })),
  ]

  const filtered = beanFilter === 'all'
    ? enriched
    : enriched.filter(r => r._bean?.id === beanFilter)

  const sorted = [...filtered].sort((a, b) => {
    const { col, dir } = sort
    if (col === 'date') return dir * a.date?.localeCompare(b.date ?? '')
    if (col === 'score') return dir * ((parseFloat(a.cupping_score) || 0) - (parseFloat(b.cupping_score) || 0))
    if (col === 'dev')   return dir * ((parseFloat(a.dev_pct) || 0) - (parseFloat(b.dev_pct) || 0))
    if (col === 'fc')    return dir * ((parseFloat(a.actual_fc_temp) || 0) - (parseFloat(b.actual_fc_temp) || 0))
    if (col === 'loss')  return dir * ((parseFloat(a.weight_loss_pct) || 0) - (parseFloat(b.weight_loss_pct) || 0))
    if (col === 'end')   return dir * ((parseFloat(a.roast_end_temp) || 0) - (parseFloat(b.roast_end_temp) || 0))
    return 0
  })

  function toggleSort(col) {
    setSort(s => s.col === col ? { col, dir: -s.dir } : { col, dir: -1 })
  }

  return (
    <div className="nx-page">
      <NxNav page={page} onNavigate={onNavigate} />

      <div className="nx-page-body">
        <div className="nx-page-header">
          <h1 className="nx-page-title">炉次</h1>
          <p className="nx-page-sub">{roasts.length} 条烘焙记录</p>
        </div>

        <div className="nx-filter-bar">
          {FILTERS.map(f => (
            <button key={f.id}
                    className={`nx-filter-chip ${beanFilter === f.id ? 'active' : ''}`}
                    onClick={() => setBeanFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="nx-table-wrap">
          <table className="nx-roast-table">
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.id}
                      className={sort.col === c.id ? 'active' : ''}
                      onClick={() => toggleSort(c.id)}>
                    {c.label}
                    {sort.col === c.id && (
                      <span className="nx-sort-arrow">{sort.dir === 1 ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => {
                const accent = r._vis?.accent ?? '#737373'
                return (
                  <tr key={r.roast_id}
                      onClick={() => r._bean && onSelectBean(r._bean.id)}
                      style={{ cursor: r._bean ? 'pointer' : 'default' }}>
                    <td className="nx-td-date">{r.date ?? '—'}</td>
                    <td>
                      <span className="nx-td-bean-dot" style={{ background: accent }}/>
                      <span>{r.green_bean ?? '—'}</span>
                    </td>
                    <td>
                      <span className="nx-td-ver">{r.profile_version ?? '—'}</span>
                    </td>
                    <td className="nx-td-num" style={{ color: accent }}>
                      {r.actual_fc_temp && r.actual_fc_temp !== 'N/A' ? `${r.actual_fc_temp}°` : '—'}
                    </td>
                    <td className="nx-td-num" style={{ color: accent, fontWeight: 700 }}>
                      {r.dev_pct ?? '—'}
                    </td>
                    <td className="nx-td-num">
                      {r.roast_end_temp ? `${r.roast_end_temp}°` : '—'}
                    </td>
                    <td className="nx-td-num">{r.weight_loss_pct ?? '—'}</td>
                    <td className="nx-td-num" style={{ color: scoreColor(r.cupping_score), fontWeight: 700 }}>
                      {r.cupping_score ? `★ ${r.cupping_score}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
