import React, { useState, useCallback } from 'react'
import { LogoIcon } from '../components/Logo.jsx'
import RoastCurve from '../components/RoastCurve.jsx'
import MarkdownPanel from '../components/MarkdownPanel.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

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

function ScoreColor(s) {
  const n = parseFloat(s)
  if (!n) return 'var(--text3)'
  if (n >= 8) return 'var(--green)'
  if (n >= 6) return 'var(--accent)'
  return 'var(--red)'
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

  const handleSelectRow = useCallback((row) => {
    setSelectedRow(row)
    const logNum    = parseInt(row.roast_id) + klogOffset
    const candidate = `log${String(logNum).padStart(4, '0')}`
    setSelectedKlog(klogs?.includes(candidate) ? candidate : klogs?.[klogs.length - 1])
    setTab('curve')
  }, [klogs, klogOffset])

  // 当前选中行
  const row = selectedRow ?? roasts[roasts.length - 1]

  return (
    <div className="bean-page">

      {/* ── Header ── */}
      <header className="bean-header">
        <div className="bean-header-left">
          <LogoIcon size={24} />
          <button className="back-btn" onClick={onBack}>‹ 返回</button>
          <span className="bean-header-sep">/</span>
          <span className="bean-header-name">{beanName}</span>
        </div>
        <div className="bean-header-stats">
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>
            {roasts.length} 炉次
          </span>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className="bean-tabs-bar">
        {TABS.map(t => (
          <button key={t.id}
            className={`bean-tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="bean-content">

        {/* 曲线 + 烘焙记录：左侧炉次列表 + 右侧内容 */}
        {(tab === 'curve' || tab === 'log') && (
          <div className="bean-split">
            {/* 左：炉次列表 */}
            <div className="bean-roast-list">
              <div className="brl-header">炉次 · {roasts.length}</div>
              <div className="brl-scroll">
                {[...roasts].reverse().map(r => {
                  const logNum    = parseInt(r.roast_id) + klogOffset
                  const klog      = `log${String(logNum).padStart(4, '0')}`
                  const isActive  = selectedKlog === klog
                  const hasKlog   = klogs?.includes(klog)
                  return (
                    <div key={r.roast_id}
                      className={`brl-item ${isActive ? 'active' : ''}`}
                      style={{ opacity: hasKlog ? 1 : 0.4 }}
                      onClick={() => hasKlog && handleSelectRow(r)}>
                      <div className="brl-item-top">
                        <span className="brl-id">{klog.replace('log0', '#')}</span>
                        <span style={{ fontSize: 11, color: ScoreColor(r.cupping_score), fontWeight: 700 }}>
                          {r.cupping_score ? `★${r.cupping_score}` : '—'}
                        </span>
                      </div>
                      <div className="brl-item-sub">
                        <span>{r.date}</span>
                        <span style={{ color: 'var(--text3)' }}>·</span>
                        <span style={{ color: 'var(--accent)' }}>{r.profile_version}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右：主内容 */}
            <div className="bean-main">
              {tab === 'curve' && (
                <>
                  {/* 统计卡 */}
                  {row && (
                    <div className="curve-stats-row">
                      {[
                        { label: '一爆温度', value: row.actual_fc_temp !== 'N/A' ? row.actual_fc_temp : '—', unit: '°C', color: 'var(--accent)' },
                        { label: '发展比',   value: row.dev_pct || '—' },
                        { label: '出豆温度', value: row.roast_end_temp || '—', unit: '°C' },
                        { label: '总时长',   value: fmtTime(row.total_time_s) },
                        { label: '失重率',   value: row.weight_loss_pct || '—' },
                        { label: '杯测',     value: row.cupping_score || '—', color: ScoreColor(row.cupping_score) },
                      ].map(s => (
                        <div key={s.label} className="cstat-card">
                          <div className="cstat-label">{s.label}</div>
                          <div className="cstat-value" style={{ color: s.color }}>
                            {s.value}
                            {s.unit && <span className="cstat-unit">{s.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 曲线图 */}
                  <div className="curve-card">
                    <ErrorBoundary>
                      <RoastCurve klogName={selectedKlog} />
                    </ErrorBoundary>
                  </div>
                </>
              )}

              {tab === 'log' && (
                <div className="log-table-wrap">
                  <table className="log-table">
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
                            className={selectedKlog === klog ? 'active' : ''}
                            onClick={() => handleSelectRow(r)}>
                            <td style={{ color:'var(--text3)', fontVariantNumeric:'tabular-nums' }}>
                              {klog.replace('log0','#')}
                            </td>
                            <td>{r.date}</td>
                            <td style={{ color:'var(--accent)' }}>{r.profile_version}</td>
                            <td style={{ color:'var(--accent)', fontVariantNumeric:'tabular-nums' }}>{r.actual_fc_temp || '—'}</td>
                            <td>{r.dev_pct || '—'}</td>
                            <td>{r.roast_end_temp || '—'}</td>
                            <td>{fmtTime(r.total_time_s)}</td>
                            <td>{r.weight_loss_pct || '—'}</td>
                            <td style={{ color: ScoreColor(r.cupping_score), fontWeight:700 }}>{r.cupping_score || '—'}</td>
                            <td style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', color:'var(--text3)', fontSize:11 }}>
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

        {/* 生豆信息：全宽 */}
        {tab === 'bean' && (
          <div className="bean-full-content">
            <MarkdownPanel
              src={beanCardFile ? `01_green_beans/${beanCardFile}.md` : null}
              placeholder="暂无生豆信息卡"
            />
          </div>
        )}

        {/* 杯测反馈 */}
        {tab === 'cupping' && (
          <div className="bean-split-file">
            <div className="file-sidebar">
              <div className="brl-header">杯测记录</div>
              {[...cuppingFiles].reverse().map(name => (
                <div key={name}
                  className={`file-item ${selectedCupping === name ? 'active' : ''}`}
                  onClick={() => setSelectedCupping(name)}>
                  {name.replace('cupping_','').replace(/_/g,' ')}
                </div>
              ))}
            </div>
            <div className="bean-main">
              <MarkdownPanel
                src={selectedCupping ? `05_cupping/${selectedCupping}.md` : null}
                placeholder="请从左侧选择杯测记录"
              />
            </div>
          </div>
        )}

        {/* 复盘小结 */}
        {tab === 'analysis' && (
          <div className="bean-split-file">
            <div className="file-sidebar">
              <div className="brl-header">分析报告</div>
              {[...analysisFiles].reverse().map(name => (
                <div key={name}
                  className={`file-item ${selectedAnalysis === name ? 'active' : ''}`}
                  onClick={() => setSelectedAnalysis(name)}>
                  {name.replace(/_analysis$/,'').replace(/_/g,' ')}
                </div>
              ))}
            </div>
            <div className="bean-main">
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
