import React, { useState, useCallback } from 'react'
import RoastCurve from '../components/RoastCurve.jsx'
import MarkdownPanel from '../components/MarkdownPanel.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import OriginArt from '../components/icons/OriginArt.jsx'
import OriginIcon from '../components/icons/OriginIcon.jsx'
import { beanPoster, FALLBACK_POSTER } from '../config/beanVisuals.js'

const TABS = [
  { id: 'curve',    label: '📈 烘焙曲线' },
  { id: 'log',      label: '📋 烘焙记录' },
  { id: 'bean',     label: '🫘 生豆信息' },
  { id: 'cupping',  label: '☕ 杯测反馈' },
  { id: 'analysis', label: '📝 复盘小结' },
]

function fmtTime(sec) {
  if (!sec || sec === 'N/A') return '—'
  const s = parseFloat(sec)
  if (isNaN(s)) return sec
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
}

function scoreColor(s) {
  const n = parseFloat(s)
  if (!n) return '#737373'
  if (n >= 8) return '#1ed760'
  if (n >= 6) return '#f0a030'
  return '#e50914'
}

export default function BeanPage({
  beanId, beanName, beanCardFile, klogOffset = 69,
  roasts, klogs, cuppingFiles, analysisFiles,
  onBack,
}) {
  const [tab, setTab]                           = useState('curve')
  const [selectedKlog, setSelectedKlog]         = useState(() => klogs?.[klogs.length - 1] ?? null)
  const [selectedCupping, setSelectedCupping]   = useState(() => cuppingFiles?.[cuppingFiles.length - 1] ?? null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(() => analysisFiles?.[analysisFiles.length - 1] ?? null)
  const [selectedRow, setSelectedRow]           = useState(null)

  const vis = beanPoster[beanId] || FALLBACK_POSTER
  const accent = vis.accent || '#1ed760'

  const handleSelectRow = useCallback((row) => {
    setSelectedRow(row)
    const logNum    = parseInt(row.roast_id) + klogOffset
    const candidate = `log${String(logNum).padStart(4, '0')}`
    setSelectedKlog(klogs?.includes(candidate) ? candidate : klogs?.[klogs.length - 1])
    setTab('curve')
  }, [klogs, klogOffset])

  const row = selectedRow ?? roasts[roasts.length - 1]

  const bestScore = roasts.reduce((best, r) => {
    const s = parseFloat(r.cupping_score)
    return (s > best) ? s : best
  }, 0)

  const versionSet = [...new Set(roasts.map(r => r.profile_version).filter(Boolean))]
  const versions = versionSet.length ? `v1–v${versionSet.length}` : '—'

  return (
    <div className="nx-bean-page">

      {/* ── Hero billboard ── */}
      <div className="nx-bp-hero">
        <div className="nx-bp-hero-bg" style={{ background: vis.grad }}/>
        <OriginArt kind={vis.kind}/>
        <div className="nx-bp-hero-fade-h"/>
        <div className="nx-bp-hero-fade-v"/>

        <button className="nx-bp-back" onClick={onBack}>← 返回</button>

        <div className="nx-bp-hero-content">
          <div className="nx-bp-eyebrow" style={{ color: accent }}>
            <OriginIcon kind={vis.kind} size={13} color={accent}/>
            {vis.region ?? 'COX·LAB'}
          </div>
          <h1 className="nx-bp-title">{beanName}</h1>
          <div className="nx-bp-meta">
            <span>{roasts.length} 炉次</span>
            <span className="nx-bp-dot">·</span>
            <span>{versions}</span>
            {bestScore > 0 && <>
              <span className="nx-bp-dot">·</span>
              <span style={{ color: accent, fontWeight: 700 }}>★ {bestScore.toFixed(1)} / 10</span>
            </>}
            <span className="nx-bp-dot">·</span>
            <span className="nx-bp-chip">{vis.tag}</span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="nx-bp-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`nx-bp-tab ${tab === t.id ? 'active' : ''}`}
            style={tab === t.id ? { borderBottomColor: accent, color: '#fff' } : {}}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="nx-bp-body">

        {/* 曲线 + 烘焙记录：左侧炉次 + 右侧内容 */}
        {(tab === 'curve' || tab === 'log') && (
          <div className="nx-bp-split">

            {/* 左：炉次 Episode 列表 */}
            <div className="nx-bp-episodes">
              <div className="nx-bp-ep-header">
                炉次 · <span style={{ color: accent }}>{roasts.length}</span>
              </div>
              <div className="nx-bp-ep-scroll">
                {[...roasts].reverse().map((r, idx) => {
                  const logNum   = parseInt(r.roast_id) + klogOffset
                  const klog     = `log${String(logNum).padStart(4, '0')}`
                  const isActive = selectedKlog === klog
                  const hasKlog  = klogs?.includes(klog)
                  const num      = [...roasts].length - idx
                  return (
                    <div key={r.roast_id}
                         className={`nx-bp-ep-item ${isActive ? 'active' : ''} ${!hasKlog ? 'no-klog' : ''}`}
                         style={isActive ? { borderColor: accent, background: 'rgba(255,255,255,0.05)' } : {}}
                         onClick={() => hasKlog && handleSelectRow(r)}>
                      <div className="nx-bp-ep-num"
                           style={{ WebkitTextStroke: `1px ${accent}`, color: 'transparent' }}>
                        {num}
                      </div>
                      <div className="nx-bp-ep-info">
                        <div className="nx-bp-ep-top">
                          <span className="nx-bp-ep-id">{klog.replace('log0', '#')}</span>
                          <span className="nx-bp-ep-ver">{r.profile_version}</span>
                          {r.cupping_score && (
                            <span style={{ color: scoreColor(r.cupping_score), fontWeight: 700, fontSize: 11 }}>
                              ★{r.cupping_score}
                            </span>
                          )}
                        </div>
                        <div className="nx-bp-ep-sub">
                          {r.date}
                          {r.dev_pct && <span style={{ color: accent }}>发展比 {r.dev_pct}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右：主内容 */}
            <div className="nx-bp-main">

              {tab === 'curve' && (
                <>
                  {/* 统计卡 */}
                  {row && (
                    <div className="nx-bp-stats">
                      {[
                        { label: '一爆温度', value: row.actual_fc_temp !== 'N/A' ? row.actual_fc_temp : '—', unit: '°C', hi: true },
                        { label: '发展比',   value: row.dev_pct || '—', hi: true },
                        { label: '出豆温度', value: row.roast_end_temp || '—', unit: '°C' },
                        { label: '总时长',   value: fmtTime(row.total_time_s) },
                        { label: '失重率',   value: row.weight_loss_pct || '—' },
                        { label: '杯测',     value: row.cupping_score || '—',
                          style: { color: scoreColor(row.cupping_score) } },
                      ].map(s => (
                        <div key={s.label} className="nx-bp-stat-card">
                          <div className="nx-bp-stat-label">{s.label}</div>
                          <div className="nx-bp-stat-value"
                               style={s.hi ? { color: accent } : s.style ?? {}}>
                            {s.value}
                            {s.unit && <span className="nx-bp-stat-unit">{s.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 曲线图 */}
                  <div className="nx-bp-curve-card">
                    <ErrorBoundary>
                      <RoastCurve klogName={selectedKlog} />
                    </ErrorBoundary>
                  </div>
                </>
              )}

              {tab === 'log' && (
                <div className="nx-table-wrap">
                  <table className="nx-roast-table">
                    <thead>
                      <tr>
                        {['#','日期','版本','一爆℃','发展比','出豆℃','总时','失重','杯测','风味'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...roasts].reverse().map(r => {
                        const logNum = parseInt(r.roast_id) + klogOffset
                        const klog   = `log${String(logNum).padStart(4, '0')}`
                        return (
                          <tr key={r.roast_id}
                              className={selectedKlog === klog ? 'nx-row-active' : ''}
                              style={selectedKlog === klog
                                ? { background: `rgba(${hexToRgb(accent)},0.08)` }
                                : {}}
                              onClick={() => handleSelectRow(r)}>
                            <td className="nx-td-date" style={{ color: '#b3b3b3' }}>
                              {klog.replace('log0', '#')}
                            </td>
                            <td className="nx-td-date">{r.date}</td>
                            <td><span className="nx-td-ver">{r.profile_version}</span></td>
                            <td className="nx-td-num" style={{ color: accent }}>
                              {r.actual_fc_temp || '—'}
                            </td>
                            <td className="nx-td-num" style={{ color: accent, fontWeight: 700 }}>
                              {r.dev_pct || '—'}
                            </td>
                            <td className="nx-td-num">{r.roast_end_temp || '—'}</td>
                            <td className="nx-td-num">{fmtTime(r.total_time_s)}</td>
                            <td className="nx-td-num">{r.weight_loss_pct || '—'}</td>
                            <td className="nx-td-num"
                                style={{ color: scoreColor(r.cupping_score), fontWeight: 700 }}>
                              {r.cupping_score || '—'}
                            </td>
                            <td style={{ maxWidth: 160, overflow: 'hidden',
                                         textOverflow: 'ellipsis', color: '#737373', fontSize: 11 }}>
                              {r.flavor_notes || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 生豆信息 */}
        {tab === 'bean' && (
          <div className="nx-bp-full">
            <MarkdownPanel
              src={beanCardFile ? `01_green_beans/${beanCardFile}.md` : null}
              placeholder="暂无生豆信息卡"
            />
          </div>
        )}

        {/* 杯测反馈 */}
        {tab === 'cupping' && (
          <div className="nx-bp-split-file">
            <div className="nx-bp-file-sidebar">
              <div className="nx-bp-ep-header">杯测记录</div>
              {[...cuppingFiles].reverse().map(name => (
                <div key={name}
                     className={`nx-bp-file-item ${selectedCupping === name ? 'active' : ''}`}
                     style={selectedCupping === name
                       ? { borderColor: accent, color: accent, background: `rgba(${hexToRgb(accent)},0.08)` }
                       : {}}
                     onClick={() => setSelectedCupping(name)}>
                  {name.replace('cupping_', '').replace(/_/g, ' ')}
                </div>
              ))}
            </div>
            <div className="nx-bp-main nx-bp-main-md">
              <MarkdownPanel
                src={selectedCupping ? `05_cupping/${selectedCupping}.md` : null}
                placeholder="请从左侧选择杯测记录"
              />
            </div>
          </div>
        )}

        {/* 复盘小结 */}
        {tab === 'analysis' && (
          <div className="nx-bp-split-file">
            <div className="nx-bp-file-sidebar">
              <div className="nx-bp-ep-header">分析报告</div>
              {[...analysisFiles].reverse().map(name => (
                <div key={name}
                     className={`nx-bp-file-item ${selectedAnalysis === name ? 'active' : ''}`}
                     style={selectedAnalysis === name
                       ? { borderColor: accent, color: accent, background: `rgba(${hexToRgb(accent)},0.08)` }
                       : {}}
                     onClick={() => setSelectedAnalysis(name)}>
                  {name.replace(/_analysis$/, '').replace(/_/g, ' ')}
                </div>
              ))}
            </div>
            <div className="nx-bp-main nx-bp-main-md">
              <MarkdownPanel
                src={selectedAnalysis ? `04_analysis/${selectedAnalysis}.md` : null}
                placeholder="请从左侧选择分析报告"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// Helper: '#1ed760' → '30,215,96'
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}
