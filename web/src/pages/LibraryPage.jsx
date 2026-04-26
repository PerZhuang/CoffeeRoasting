import React, { useState } from 'react'
import NxNav from '../components/NxNav.jsx'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'
import OriginArt from '../components/icons/OriginArt.jsx'
import OriginIcon from '../components/icons/OriginIcon.jsx'

export default function LibraryPage({ roasts, beans, page, onNavigate, onSelectBean }) {
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)

  const beanStats = beans.map(b => {
    const rows = roasts.filter(r =>
      r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase())
    )
    const scores = rows.map(r => parseFloat(r.cupping_score)).filter(n => !isNaN(n) && n > 0)
    const best = scores.length ? Math.max(...scores) : null
    const versionSet = [...new Set(rows.map(r => r.profile_version).filter(Boolean))]
    const versions = versionSet.length ? `v1–v${versionSet.length}` : '—'
    const lastRow = rows[rows.length - 1]
    const vis = beanPoster[b.id] || FALLBACK_POSTER
    return { ...b, count: rows.length, best, versions, lastDate: lastRow?.date ?? '—', vis }
  })

  const FILTERS = [
    { id: 'all', label: '全部' },
    ...beans.map(b => ({ id: b.id, label: b.name.slice(0, 4) })),
  ]

  const filtered = filter === 'all' ? beanStats : beanStats.filter(b => b.id === filter)

  return (
    <div className="nx-page">
      <NxNav page={page} onNavigate={onNavigate} />

      <div className="nx-page-body">
        <div className="nx-page-header">
          <h1 className="nx-page-title">我的豆库</h1>
          <p className="nx-page-sub">{beans.length} 个品种 · {roasts.length} 炉次总计</p>
        </div>

        <div className="nx-filter-bar">
          {FILTERS.map(f => (
            <button key={f.id}
                    className={`nx-filter-chip ${filter === f.id ? 'active' : ''}`}
                    onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="nx-library-grid">
          {filtered.map(b => (
            <LibraryCard key={b.id} bean={b} vis={b.vis}
                         hovered={hovered === b.id}
                         onHover={() => setHovered(b.id)}
                         onLeave={() => setHovered(null)}
                         onClick={() => onSelectBean(b.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LibraryCard({ bean, vis, hovered, onHover, onLeave, onClick }) {
  return (
    <div className="nx-lib-card"
         style={{
           transform: hovered ? 'scale(1.025)' : 'scale(1)',
           boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.8)' : '0 2px 8px rgba(0,0,0,0.4)',
         }}
         onClick={onClick}
         onMouseEnter={onHover}
         onMouseLeave={onLeave}>
      <div className="nx-lib-card-bg" style={{ background: vis.grad }}/>
      <OriginArt kind={vis.kind}/>
      <div className="nx-lib-card-fade"/>

      <div className="nx-lib-card-tag" style={{ color: vis.accent, borderColor: vis.accent }}>
        <OriginIcon kind={vis.kind} size={11} color={vis.accent}/>
        {vis.tag}
      </div>
      {bean.best && (
        <div className="nx-lib-card-score" style={{ color: vis.accent }}>
          ★ {bean.best.toFixed(1)}
        </div>
      )}

      <div className="nx-lib-card-body">
        <div className="nx-lib-card-name">{bean.name}</div>
        <div className="nx-lib-card-region">{vis.region} · {bean.variety} · {bean.process}</div>
        <div className="nx-lib-card-tagline" style={{ color: vis.accent }}>{vis.tagline}</div>
        <div className="nx-lib-card-footer">
          <span>{bean.count} 炉次</span>
          <span className="nx-sep3">·</span>
          <span>{bean.versions}</span>
          <span className="nx-sep3">·</span>
          <span>{bean.altitude}</span>
          <span className="nx-lib-card-date">{bean.lastDate}</span>
        </div>
      </div>
    </div>
  )
}
