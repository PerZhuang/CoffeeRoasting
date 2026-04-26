import React, { useState, useMemo } from 'react'
import NxNav from '../components/NxNav.jsx'
import MarkdownPanel from '../components/MarkdownPanel.jsx'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'

function scoreColor(s) {
  const n = parseFloat(s)
  if (!n) return '#737373'
  if (n >= 8) return '#1ed760'
  if (n >= 6) return '#f0a030'
  return '#e50914'
}

export default function CuppingPage({ roasts, beans, manifest, page, onNavigate }) {
  const [selected, setSelected] = useState(null)
  const [beanFilter, setBeanFilter] = useState('all')

  const allCuppingFiles = manifest?.cupping ?? []

  const cards = useMemo(() => {
    return allCuppingFiles.map(name => {
      const b = beans.find(b => b.cuppingFilter?.(name))
      const vis = b ? (beanPoster[b.id] || FALLBACK_POSTER) : FALLBACK_POSTER
      const beanRows = b
        ? roasts.filter(r => r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase()))
        : []
      const scores = beanRows.map(r => parseFloat(r.cupping_score)).filter(n => !isNaN(n) && n > 0)
      const best = scores.length ? Math.max(...scores) : null
      return { name, b, vis, best }
    })
  }, [allCuppingFiles, beans, roasts])

  const FILTERS = [
    { id: 'all', label: '全部' },
    ...beans.map(b => ({ id: b.id, label: b.name.slice(0, 4) })),
  ]

  const filtered = beanFilter === 'all'
    ? cards
    : cards.filter(c => c.b?.id === beanFilter)

  const displayCards = [...filtered].reverse()

  function formatName(name) {
    return name.replace(/^cupping_/, '').replace(/_/g, ' ')
  }

  return (
    <div className="nx-page">
      <NxNav page={page} onNavigate={onNavigate} />

      <div className="nx-page-body">
        <div className="nx-page-header">
          <h1 className="nx-page-title">杯测</h1>
          <p className="nx-page-sub">{allCuppingFiles.length} 份杯测记录</p>
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

        {selected ? (
          <div className="nx-cupping-detail">
            <button className="nx-cupping-back"
                    onClick={() => setSelected(null)}>
              ← 返回列表
            </button>
            <MarkdownPanel
              src={`05_cupping/${selected}.md`}
              placeholder="暂无内容"
            />
          </div>
        ) : (
          <div className="nx-cupping-wall">
            {displayCards.length === 0 && (
              <div style={{ color: '#737373', padding: '40px 0' }}>暂无杯测记录</div>
            )}
            {displayCards.map(c => (
              <div key={c.name}
                   className="nx-cupping-card"
                   style={{ borderTopColor: c.vis.accent }}
                   onClick={() => setSelected(c.name)}>
                <div className="nx-cupping-card-dot" style={{ background: c.vis.accent }}/>
                <div className="nx-cupping-card-name">{formatName(c.name)}</div>
                {c.b && (
                  <div className="nx-cupping-card-bean" style={{ color: c.vis.accent }}>
                    {c.b.name}
                  </div>
                )}
                {c.best && (
                  <div className="nx-cupping-card-score"
                       style={{ color: scoreColor(c.best) }}>
                    ★ {c.best.toFixed(1)}
                  </div>
                )}
                <div className="nx-cupping-card-cta">查看详情 →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
