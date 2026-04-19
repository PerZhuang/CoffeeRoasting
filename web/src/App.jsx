import React, { useEffect, useState, useCallback } from 'react'
import RoastList, { BEANS } from './components/RoastList.jsx'
import RoastCurve from './components/RoastCurve.jsx'
import MarkdownPanel from './components/MarkdownPanel.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { loadManifest, loadRoastLog } from './utils/dataLoader.js'

const BTABS = [
  { id: 'bean',     label: '🫘 生豆信息卡' },
  { id: 'cupping',  label: '☕ 杯测反馈' },
  { id: 'analysis', label: '📝 复盘小结' },
  { id: 'log',      label: '📋 完整日志' },
]

function StatCard({ label, value, unit, sub, diffVal, accent }) {
  const style = accent ? { color: accent } : {}
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={style}>
        {value ?? '—'}{unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)', marginLeft: 2 }}>{unit}</span>}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}

function fmtTime(sec) {
  if (!sec || sec === 'N/A') return '—'
  const s = parseFloat(sec)
  if (isNaN(s)) return sec
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
}

export default function App() {
  const [manifest, setManifest]         = useState(null)
  const [roasts, setRoasts]             = useState([])
  const [beanId, setBeanId]             = useState('all')
  const [selectedRow, setSelectedRow]   = useState(null)
  const [selectedKlog, setSelectedKlog] = useState(null)
  const [btab, setBtab]                 = useState('bean')
  const [selectedCupping, setSelectedCupping]   = useState(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([loadManifest(), loadRoastLog()])
      .then(([mf, rows]) => {
        setManifest(mf)
        setRoasts(rows)
        if (mf?.klogs?.length)    setSelectedKlog(mf.klogs[mf.klogs.length - 1])
        if (mf?.cupping?.length)  setSelectedCupping(mf.cupping[mf.cupping.length - 1])
        if (mf?.analysis?.length) setSelectedAnalysis(mf.analysis[mf.analysis.length - 1])
        // 默认选中最新一行 CSV
        if (rows?.length) {
          const last = rows[rows.length - 1]
          setSelectedRow(last)
        }
        setLoading(false)
      })
      .catch(e => { console.error(e); setLoading(false) })
  }, [])

  const bean = BEANS.find(b => b.id === beanId) || BEANS[0]

  const handleSelectRow = useCallback((row) => {
    setSelectedRow(row)
    if (manifest?.klogs) {
      const logNum  = parseInt(row.roast_id) + 69
      const candidate = `log${String(logNum).padStart(4, '0')}`
      setSelectedKlog(manifest.klogs.includes(candidate)
        ? candidate
        : manifest.klogs[manifest.klogs.length - 1])
    }
  }, [manifest])

  // 聚合统计
  const filtered = bean.filter
    ? roasts.filter(r => r.green_bean?.toLowerCase().includes(bean.filter.toLowerCase()))
    : roasts
  const scores = filtered.map(r => parseFloat(r.cupping_score)).filter(Boolean)
  const bestScore = scores.length ? Math.max(...scores) : null
  const avgDevPct = filtered.length
    ? (filtered.reduce((s, r) => s + (parseFloat(r.dev_pct) || 0), 0) / filtered.filter(r => r.dev_pct).length).toFixed(1)
    : null

  // 当前选中行的统计
  const row = selectedRow

  // 生豆卡 src
  const beanCardSrc = bean.card ? `01_green_beans/${bean.card}.md` : null

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                    height:'100vh', background:'var(--bg)', color:'var(--text3)',
                    flexDirection:'column', gap:12 }}>
        <div style={{ fontSize: 32 }}>☕</div>
        <div style={{ fontSize: 14, letterSpacing: '.05em' }}>加载数据中…</div>
      </div>
    )
  }

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          <span className="header-logo-icon">☕</span>
          Kaffelogic
          <span className="header-logo-sub">Nano 7e</span>
        </div>

        <div className="bean-tabs">
          {BEANS.map(b => (
            <button
              key={b.id}
              className={`bean-tab ${beanId === b.id ? 'active' : ''}`}
              onClick={() => setBeanId(b.id)}
            >
              <span className="bean-tab-dot" style={{ background: b.dot }} />
              {b.label}
            </button>
          ))}
        </div>

        <div className="header-stats">
          <div className="hstat">
            <div className="hstat-val">{filtered.length}</div>
            <div className="hstat-label">炉次</div>
          </div>
          <div className="hstat">
            <div className="hstat-val" style={{ color: 'var(--green)' }}>{bestScore ?? '—'}</div>
            <div className="hstat-label">最高杯测</div>
          </div>
          <div className="hstat">
            <div className="hstat-val">{avgDevPct ?? '—'}<span style={{ fontSize:11, color:'var(--text3)' }}>%</span></div>
            <div className="hstat-label">平均发展比</div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="body">

        {/* ── Left: roast list ── */}
        <RoastList
          roasts={roasts}
          klogs={manifest?.klogs}
          beanFilter={bean.filter}
          selectedKlog={selectedKlog}
          onSelect={handleSelectRow}
        />

        {/* ── Right: detail ── */}
        <div className="detail">

          {/* Stats row */}
          <div className="stats-row">
            <StatCard label="一爆温度" value={row?.actual_fc_temp !== 'N/A' ? row?.actual_fc_temp : '—'}
              unit="°C" sub={row?.expect_fc ? `目标 ${row.expect_fc}°C` : ''} accent="var(--accent)" />
            <StatCard label="发展比" value={row?.dev_pct || '—'} sub="理想 13–22%" />
            <StatCard label="出豆温度" value={row?.roast_end_temp || '—'} unit="°C" />
            <StatCard label="总时长" value={fmtTime(row?.total_time_s)} sub={row?.dev_time_s ? `发展 ${fmtTime(row.dev_time_s)}` : ''} />
            <StatCard label="失重率" value={row?.weight_loss_pct || '—'}
              sub="目标 9–11%" accent={parseFloat(row?.weight_loss_pct) >= 9 ? 'var(--green)' : undefined} />
            <StatCard label="杯测评分"
              value={row?.cupping_score || '—'}
              accent={parseFloat(row?.cupping_score) >= 8 ? 'var(--green)' : parseFloat(row?.cupping_score) >= 6 ? 'var(--accent)' : undefined}
              sub={row?.flavor_notes?.slice(0, 18) || ''} />
          </div>

          {/* Curve */}
          <div className="curve-section">
            <div className="curve-card">
              <ErrorBoundary>
                <RoastCurve klogName={selectedKlog} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Bottom tabs */}
          <div className="bottom-section">
            <div className="bottom-tabs">
              {BTABS.map(t => (
                <button key={t.id} className={`btab ${btab === t.id ? 'active' : ''}`}
                  onClick={() => setBtab(t.id)}>{t.label}</button>
              ))}
            </div>

            {btab === 'bean' && (
              beanId === 'all'
                ? <div className="empty"><div className="empty-icon">🫘</div>
                    <div className="empty-text">从顶部选择豆子查看信息卡</div></div>
                : <MarkdownPanel src={beanCardSrc} placeholder="暂无信息卡" />
            )}

            {btab === 'cupping' && manifest?.cupping?.length > 0 && (
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0, width:200 }}>
                  {[...manifest.cupping].reverse().map(name => (
                    <div
                      key={name}
                      onClick={() => setSelectedCupping(name)}
                      style={{
                        padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                        background: selectedCupping === name ? 'var(--accent-dim)' : 'var(--card)',
                        border: `1px solid ${selectedCupping === name ? 'var(--accent)' : 'var(--border)'}`,
                        color: selectedCupping === name ? 'var(--accent)' : 'var(--text2)',
                        transition: 'all .12s',
                      }}
                    >
                      {name.replace('cupping_', '').replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <MarkdownPanel
                    src={selectedCupping ? `05_cupping/${selectedCupping}.md` : null}
                    placeholder="请选择杯测记录"
                  />
                </div>
              </div>
            )}

            {btab === 'analysis' && manifest?.analysis?.length > 0 && (
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0, width:200 }}>
                  {[...manifest.analysis].reverse().map(name => (
                    <div
                      key={name}
                      onClick={() => setSelectedAnalysis(name)}
                      style={{
                        padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                        background: selectedAnalysis === name ? 'var(--accent-dim)' : 'var(--card)',
                        border: `1px solid ${selectedAnalysis === name ? 'var(--accent)' : 'var(--border)'}`,
                        color: selectedAnalysis === name ? 'var(--accent)' : 'var(--text2)',
                        transition: 'all .12s',
                      }}
                    >
                      {name.replace(/_analysis$/, '').replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <MarkdownPanel
                    src={selectedAnalysis ? `04_analysis/${selectedAnalysis}.md` : null}
                    placeholder="请选择分析报告"
                  />
                </div>
              </div>
            )}

            {btab === 'log' && (
              <div className="log-table-wrap">
                <table className="log-table">
                  <thead>
                    <tr>
                      {['#','日期','豆子','版本','一爆℃','发展比','出豆℃','总时s','失重','杯测','风味'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...filtered].reverse().map(r => (
                      <tr key={r.roast_id}
                        className={selectedRow?.roast_id === r.roast_id ? 'active' : ''}
                        onClick={() => handleSelectRow(r)}>
                        <td style={{ fontVariantNumeric:'tabular-nums', color:'var(--text3)' }}>{r.roast_id}</td>
                        <td>{r.date}</td>
                        <td style={{ maxWidth:100, overflow:'hidden', textOverflow:'ellipsis' }}>{r.green_bean}</td>
                        <td>{r.profile_version}</td>
                        <td style={{ color:'var(--accent)', fontVariantNumeric:'tabular-nums' }}>{r.actual_fc_temp || '—'}</td>
                        <td>{r.dev_pct || '—'}</td>
                        <td>{r.roast_end_temp || '—'}</td>
                        <td>{r.total_time_s || '—'}</td>
                        <td>{r.weight_loss_pct || '—'}</td>
                        <td style={{ color: parseFloat(r.cupping_score) >= 8 ? 'var(--green)' : 'inherit' }}>
                          {r.cupping_score || '—'}
                        </td>
                        <td style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', color:'var(--text3)', fontSize:11 }}>{r.flavor_notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
