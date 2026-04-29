import React, { useState } from 'react'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'
import OriginArt from '../components/icons/OriginArt.jsx'
import OriginIcon from '../components/icons/OriginIcon.jsx'
import V60Icon from '../components/icons/V60Icon.jsx'
import NxNav from '../components/NxNav.jsx'

export default function HomePage({ roasts, beans, page, onNavigate, onSelectBean }) {
  const [hoveredId, setHoveredId] = useState(null)

  const beanStats = beans.map(b => {
    const rows = roasts.filter(r =>
      r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase())
    )
    const scores = rows.map(r => parseFloat(r.cupping_score)).filter(n => !isNaN(n) && n > 0)
    const best = scores.length ? Math.max(...scores) : null
    const versionSet = [...new Set(rows.map(r => r.profile_version).filter(Boolean))]
    const versions = versionSet.length ? `v1–v${versionSet.length}` : '—'
    const bestRow = best ? rows.find(r => parseFloat(r.cupping_score) === best) : null
    const bestDevPct = bestRow?.dev_pct || null
    const vis = beanPoster[b.id] || FALLBACK_POSTER
    return { ...b, count: rows.length, best, versions, bestDevPct, vis }
  })

  const featured = [...beanStats]
    .filter(b => b.best !== null)
    .sort((a, b) => b.best - a.best)[0] ?? beanStats[0]

  const topBeans = [...beanStats]
    .filter(b => b.best !== null)
    .sort((a, b) => b.best - a.best)
    .slice(0, 5)

  const fv = featured?.vis ?? FALLBACK_POSTER

  return (
    <div className="nx-home">

      {/* ── Hero ── */}
      <div className="nx-hero">
        <NxNav page={page} onNavigate={onNavigate} mode="hero"/>

        <div className="nx-hero-bg" style={{ background: fv.grad }}/>
        <OriginArt kind={fv.kind}/>
        <div className="nx-hero-fade-h"/>
        <div className="nx-hero-fade-v"/>

        <div className="nx-hero-content">
          <div className="nx-hero-eyebrow">
            <OriginIcon kind={fv.kind} size={14} color="#1ed760"/>
            实验室精选
          </div>
          <h1 className="nx-hero-title">{featured?.name}</h1>
          <div className="nx-hero-meta">
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {featured?.count} 炉次 · {featured?.versions}
            </span>
            <span className="nx-sep">·</span>
            <span className="nx-hero-score">★ {featured?.best?.toFixed(1)} / 10</span>
            <span className="nx-sep">·</span>
            <span className="nx-chip-outline">
              发展比 {featured?.bestDevPct ?? fv.heroDevPct ?? '—'}
            </span>
          </div>
          <p className="nx-hero-desc">{fv.description}</p>
          <div className="nx-hero-actions">
            <button className="nx-btn-primary"
                    onClick={() => featured && onSelectBean(featured.id)}>
              <V60Icon size={16} color="#000"/>
              查看详情
            </button>
          </div>
        </div>
      </div>

      {/* ── 风味 Best ── */}
      {topBeans.length > 0 && (
        <section className="nx-section nx-best-section">
          <div className="nx-section-header">
            <h2 className="nx-section-title">风味 Best</h2>
            <span className="nx-section-sub">咖啡师认证 · 最好喝的 {topBeans.length} 支</span>
          </div>
          <div className="nx-poster-rail">
            {topBeans.map((b, i) => (
              <FlavorBestCard key={b.id} rank={i + 1} bean={b} vis={b.vis}
                              onClick={() => onSelectBean(b.id)}/>
            ))}
          </div>
        </section>
      )}

      {/* ── 我的豆库 ── */}
      <section className="nx-section nx-library-section">
        <div className="nx-section-header">
          <h2 className="nx-section-title">我的豆库</h2>
          <span className="nx-section-sub">{beanStats.length} 个品种 · 全部烘焙档案</span>
        </div>
        <div className="nx-bean-grid">
          {beanStats.map(b => (
            <BeanCard key={b.id} bean={b} vis={b.vis}
                      hovered={hoveredId === b.id}
                      onHover={() => setHoveredId(b.id)}
                      onLeave={() => setHoveredId(null)}
                      onClick={() => onSelectBean(b.id)}/>
          ))}
        </div>
      </section>

    </div>
  )
}

function FlavorBestCard({ rank, bean, vis, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    // Outer item: number bleeds left, card sits on top with z-index
    <div className="nx-poster-item">
      {/* Large rank number — behind card, partially peeking left */}
      <div className="nx-poster-rank"
           style={{ WebkitTextStroke: `2px ${vis.accent}`, color: 'transparent' }}>
        {rank}
      </div>
      {/* Card — shifted to the right, z-index above number */}
      <div className="nx-poster-card"
           style={{
             transform: hovered ? 'translateY(-4px)' : 'none',
             boxShadow: hovered ? '0 14px 30px rgba(0,0,0,0.6)' : 'none',
           }}
           onClick={onClick}
           onMouseEnter={() => setHovered(true)}
           onMouseLeave={() => setHovered(false)}>
        <div className="nx-poster-bg" style={{ background: vis.grad }}/>
        <OriginArt kind={vis.kind}/>
        <div className="nx-poster-fade"/>
        <div className="nx-poster-score" style={{ color: vis.accent }}>
          ★ {bean.best.toFixed(1)}
        </div>
        <div className="nx-poster-origin" style={{ color: vis.accent }}>
          <OriginIcon kind={vis.kind} size={12} color={vis.accent}/>
          {vis.region?.split('·')[0]?.trim()}
        </div>
        <div className="nx-poster-bottom">
          <div className="nx-poster-name">{bean.name}</div>
          <div className="nx-poster-tagline" style={{ color: vis.accent }}>{vis.tagline}</div>
          <div className="nx-poster-stats">{bean.count} 炉次 · {bean.versions}</div>
        </div>
      </div>
    </div>
  )
}

function BeanCard({ bean, vis, hovered, onHover, onLeave, onClick }) {
  return (
    <div className="nx-bean-card"
         style={{
           transform: hovered ? 'scale(1.03)' : 'scale(1)',
           boxShadow: hovered ? '0 14px 36px rgba(0,0,0,0.7)' : '0 2px 6px rgba(0,0,0,0.3)',
         }}
         onClick={onClick}
         onMouseEnter={onHover}
         onMouseLeave={onLeave}>
      <div className="nx-bean-card-bg" style={{ background: vis.grad }}/>
      <OriginArt kind={vis.kind}/>
      <div className="nx-bean-card-fade"/>
      <div className="nx-bean-tag" style={{ color: vis.accent, borderColor: vis.accent }}>
        <OriginIcon kind={vis.kind} size={11} color={vis.accent}/>
        {vis.tag}
      </div>
      {bean.best && (
        <div className="nx-bean-score" style={{ color: vis.accent }}>
          ★ {bean.best.toFixed(1)}
        </div>
      )}
      <div className="nx-bean-bottom">
        <div className="nx-bean-name">{bean.name}</div>
        <div className="nx-bean-meta">{vis.region} · {bean.variety} · {bean.process}</div>
        <div className="nx-bean-tagline" style={{ color: vis.accent }}>{vis.tagline}</div>
        <div className="nx-bean-stats">
          <span>{bean.count} 炉次</span>
          <span className="nx-sep3">·</span>
          <span>{bean.versions}</span>
          <span className="nx-sep3">·</span>
          <span>{bean.altitude}</span>
        </div>
      </div>
    </div>
  )
}
