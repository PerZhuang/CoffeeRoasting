import React, { useMemo } from 'react'
import NxNav from '../components/NxNav.jsx'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'

function scoreColor(s) {
  const n = parseFloat(s)
  if (!n) return '#737373'
  if (n >= 8) return '#1ed760'
  if (n >= 6) return '#f0a030'
  return '#e50914'
}

export default function InsightsPage({ roasts, beans, page, onNavigate, onSelectBean }) {
  const stats = useMemo(() => {
    const scored = roasts.filter(r => parseFloat(r.cupping_score) > 0)
    const scores = scored.map(r => parseFloat(r.cupping_score))
    const devs = roasts.map(r => parseFloat(r.dev_pct)).filter(n => !isNaN(n) && n > 0)

    const best = scored.reduce((a, b) =>
      parseFloat(a.cupping_score) > parseFloat(b.cupping_score) ? a : b, scored[0])

    return {
      total: roasts.length,
      scored: scored.length,
      avg: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '—',
      best: best ? parseFloat(best.cupping_score).toFixed(1) : '—',
      bestBean: best?.green_bean ?? '—',
      avgDev: devs.length ? (devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(1) : '—',
    }
  }, [roasts])

  const top5 = useMemo(() =>
    roasts
      .filter(r => parseFloat(r.cupping_score) > 0)
      .sort((a, b) => parseFloat(b.cupping_score) - parseFloat(a.cupping_score))
      .slice(0, 5)
      .map(r => {
        const b = beans.find(b => r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase()))
        const vis = b ? (beanPoster[b.id] || FALLBACK_POSTER) : FALLBACK_POSTER
        return { ...r, _bean: b, _vis: vis }
      }), [roasts, beans])

  const scatterPoints = useMemo(() =>
    roasts
      .filter(r => parseFloat(r.dev_pct) > 0 && parseFloat(r.cupping_score) > 0)
      .map(r => {
        const b = beans.find(b => r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase()))
        const vis = b ? (beanPoster[b.id] || FALLBACK_POSTER) : FALLBACK_POSTER
        return {
          dev: parseFloat(r.dev_pct),
          score: parseFloat(r.cupping_score),
          accent: vis.accent,
          label: r.profile_version ?? '',
        }
      }), [roasts, beans])

  const KPIs = [
    { label: '总烘焙炉次', value: stats.total, unit: '炉', color: '#fff' },
    { label: '平均杯测分', value: stats.avg, unit: '/ 10', color: scoreColor(stats.avg) },
    { label: '最高杯测分', value: stats.best, unit: '/ 10', color: '#1ed760' },
    { label: '平均发展比', value: `${stats.avgDev}%`, unit: '', color: '#f0a030' },
  ]

  return (
    <div className="nx-page">
      <NxNav page={page} onNavigate={onNavigate} />

      <div className="nx-page-body">
        <div className="nx-page-header">
          <h1 className="nx-page-title">数据洞察</h1>
          <p className="nx-page-sub">{stats.scored} 条含杯测评分 · {roasts.length} 炉总计</p>
        </div>

        {/* KPI row */}
        <div className="nx-kpi-grid">
          {KPIs.map(k => (
            <div key={k.label} className="nx-kpi-card">
              <div className="nx-kpi-label">{k.label}</div>
              <div className="nx-kpi-value" style={{ color: k.color }}>
                {k.value}
                {k.unit && <span className="nx-kpi-unit">{k.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="nx-insights-grid">
          {/* Scatter plot */}
          <div className="nx-scatter-card">
            <div className="nx-card-title">发展比 vs 杯测分</div>
            <div className="nx-card-sub">甜蜜区间 18–21%</div>
            <ScatterPlot points={scatterPoints}/>
          </div>

          {/* Top 5 */}
          <div className="nx-top5-card">
            <div className="nx-card-title">Top 5 最佳炉次</div>
            <div className="nx-card-sub">按杯测分排序</div>
            <div className="nx-top5-list">
              {top5.map((r, i) => (
                <div key={r.roast_id}
                     className="nx-top5-row"
                     onClick={() => r._bean && onSelectBean(r._bean.id)}
                     style={{ cursor: r._bean ? 'pointer' : 'default' }}>
                  <span className="nx-top5-rank"
                        style={{ WebkitTextStroke: `1px ${r._vis.accent}`, color: 'transparent' }}>
                    {i + 1}
                  </span>
                  <div className="nx-top5-info">
                    <div className="nx-top5-bean">{r.green_bean}</div>
                    <div className="nx-top5-meta">
                      {r.date} · {r.profile_version} · 发展比 {r.dev_pct ?? '—'}
                    </div>
                  </div>
                  <span className="nx-top5-score"
                        style={{ color: scoreColor(r.cupping_score) }}>
                    ★ {parseFloat(r.cupping_score).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScatterPlot({ points }) {
  if (!points.length) return (
    <div style={{ textAlign: 'center', color: '#737373', padding: '40px 0' }}>暂无数据</div>
  )

  const W = 560, H = 280
  const pad = { l: 44, r: 20, t: 16, b: 36 }

  const devMin = 12, devMax = 28
  const scoreMin = 4, scoreMax = 10

  const sx = d => pad.l + ((d - devMin) / (devMax - devMin)) * (W - pad.l - pad.r)
  const sy = s => H - pad.b - ((s - scoreMin) / (scoreMax - scoreMin)) * (H - pad.t - pad.b)

  const xTicks = [14, 16, 18, 20, 22, 24, 26]
  const yTicks = [5, 6, 7, 8, 9, 10]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {/* sweet-spot band */}
      <rect x={sx(18)} y={pad.t} width={sx(21) - sx(18)} height={H - pad.t - pad.b}
            fill="rgba(30,215,96,0.07)"/>
      <text x={(sx(18) + sx(21)) / 2} y={pad.t + 11}
            textAnchor="middle" fontSize="9" fill="#1ed760" fontWeight="700" letterSpacing="1">
        SWEET SPOT
      </text>

      {/* grid */}
      {xTicks.map(v => (
        <g key={v}>
          <line x1={sx(v)} y1={pad.t} x2={sx(v)} y2={H - pad.b} stroke="rgba(255,255,255,0.06)"/>
          <text x={sx(v)} y={H - pad.b + 14} textAnchor="middle"
                fontSize="10" fill="#737373" fontFamily="-apple-system">{v}%</text>
        </g>
      ))}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.l} y1={sy(v)} x2={W - pad.r} y2={sy(v)} stroke="rgba(255,255,255,0.06)"/>
          <text x={pad.l - 6} y={sy(v) + 3} textAnchor="end"
                fontSize="10" fill="#737373" fontFamily="-apple-system">{v}</text>
        </g>
      ))}

      {/* axis labels */}
      <text x={(pad.l + W - pad.r) / 2} y={H} textAnchor="middle"
            fontSize="10" fill="#737373" letterSpacing=".08em">发展比 (%)</text>
      <text x={10} y={(pad.t + H - pad.b) / 2} textAnchor="middle"
            fontSize="10" fill="#737373" letterSpacing=".08em"
            transform={`rotate(-90 10 ${(pad.t + H - pad.b) / 2})`}>杯测分</text>

      {/* points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.dev)} cy={sy(p.score)} r="5"
                  fill={p.accent} fillOpacity="0.85"
                  filter="drop-shadow(0 0 4px currentColor)"/>
        </g>
      ))}
    </svg>
  )
}
