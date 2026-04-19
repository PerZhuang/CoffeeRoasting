import React, { useEffect, useState, useCallback } from 'react'
import RoastLogTable from './components/RoastLogTable.jsx'
import RoastCurve from './components/RoastCurve.jsx'
import MarkdownPanel from './components/MarkdownPanel.jsx'
import { loadManifest, loadRoastLog } from './utils/dataLoader.js'

// 豆子配置
const BEANS = [
  { id: 'all',    label: '全部',    dot: '#888',     filter: null },
  { id: 'yunnan', label: '云南卡蒂姆', dot: '#27ae60', filter: 'Catimor',
    card: 'yunnan_puer_catimor_nat' },
  { id: 'panama', label: '巴拿马卡杜艾', dot: '#e07b20', filter: 'Catuai',
    card: 'panama_aurora_catuai_nat' },
]

const TABS = [
  { id: 'log',      label: '📋 烘焙日志' },
  { id: 'curve',    label: '📈 烘焙曲线' },
  { id: 'bean',     label: '🫘 生豆信息卡' },
  { id: 'cupping',  label: '☕ 杯测反馈' },
  { id: 'analysis', label: '📝 复盘小结' },
]

export default function App() {
  const [manifest, setManifest]     = useState(null)
  const [roasts, setRoasts]         = useState([])
  const [beanId, setBeanId]         = useState('all')
  const [tab, setTab]               = useState('log')
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedKlog, setSelectedKlog] = useState(null)
  const [selectedCupping, setSelectedCupping]   = useState(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([loadManifest(), loadRoastLog()])
      .then(([mf, rows]) => {
        setManifest(mf)
        setRoasts(rows)
        // 默认选中最新一条 klog
        if (mf?.klogs?.length) {
          setSelectedKlog(mf.klogs[mf.klogs.length - 1])
        }
        // 默认选中最新杯测和分析
        if (mf?.cupping?.length)  setSelectedCupping(mf.cupping[mf.cupping.length - 1])
        if (mf?.analysis?.length) setSelectedAnalysis(mf.analysis[mf.analysis.length - 1])
        setLoading(false)
      })
      .catch(e => { console.error(e); setLoading(false) })
  }, [])

  const bean = BEANS.find(b => b.id === beanId) || BEANS[0]

  // 点击日志行 → 切到曲线tab并尝试匹配klog
  const handleSelectRow = useCallback((row) => {
    setSelectedRow(row)
    setTab('curve')
    // 尝试按日期匹配 klog（klog 日期格式 DD/MM/YYYY）
    if (manifest?.klogs?.length) {
      const rowDate = row.date?.replace(/-/g, '') // 20260310
      // 找日期最接近的klog（简单取最后一个同豆子的）
      // 更精确的方案：加载klog meta，但为了性能先用序号近似
      const logNum = parseInt(row.roast_id) + 69  // offset: id=001 → log0070
      const candidate = `log${String(logNum).padStart(4, '0')}`
      if (manifest.klogs.includes(candidate)) {
        setSelectedKlog(candidate)
      } else {
        setSelectedKlog(manifest.klogs[manifest.klogs.length - 1])
      }
    }
  }, [manifest])

  const beanCardSrc  = bean.card ? `01_green_beans/${bean.card}.md` : null
  const cuppingSrc   = selectedCupping  ? `05_cupping/${selectedCupping}.md`  : null
  const analysisSrc  = selectedAnalysis ? `04_analysis/${selectedAnalysis}.md` : null

  if (loading) return <div className="loading" style={{ marginTop: 80, fontSize: 16 }}>☕ 加载数据中…</div>

  return (
    <div className="layout">
      {/* ── 侧边栏 ── */}
      <aside className="sidebar">
        <div className="sidebar-logo"><span>☕</span>烘焙记录</div>

        <div className="sidebar-section">
          <div className="sidebar-label">生豆</div>
          {BEANS.map(b => (
            <button
              key={b.id}
              className={`sidebar-item ${beanId === b.id ? 'active' : ''}`}
              onClick={() => setBeanId(b.id)}
            >
              <span className="sidebar-dot" style={{ background: b.dot }} />
              {b.label}
            </button>
          ))}
        </div>

        {manifest && (
          <div className="sidebar-section">
            <div className="sidebar-label">统计</div>
            <div style={{ padding: '4px 16px', fontSize: 12, color: '#a08060', lineHeight: 2 }}>
              <div>烘焙炉次 {roasts.length}</div>
              <div>klog 文件 {manifest.klogs?.length}</div>
              <div>杯测记录 {manifest.cupping?.length}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── 主内容 ── */}
      <div className="main">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="page-title">{bean.label === '全部' ? '所有烘焙记录' : bean.label}</span>
            <span className="page-subtitle">Kaffelogic Nano 7e · 手冲浅中焙</span>
          </div>
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="content">

          {/* ── 烘焙日志 ── */}
          {tab === 'log' && (
            <>
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text2)' }}>
                点击任意行查看烘焙曲线 →
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <RoastLogTable
                  rows={roasts}
                  selectedId={selectedRow?.roast_id}
                  onSelect={handleSelectRow}
                  beanFilter={bean.filter}
                />
              </div>
            </>
          )}

          {/* ── 烘焙曲线 ── */}
          {tab === 'curve' && (
            <>
              {manifest?.klogs?.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>选择曲线：</span>
                  <select
                    className="select"
                    value={selectedKlog || ''}
                    onChange={e => setSelectedKlog(e.target.value)}
                  >
                    <option value="">— 请选择 —</option>
                    {[...manifest.klogs].reverse().map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              )}
              <RoastCurve klogName={selectedKlog} />
            </>
          )}

          {/* ── 生豆信息卡 ── */}
          {tab === 'bean' && (
            <>
              {beanId === 'all' && (
                <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {BEANS.filter(b => b.card).map(b => (
                    <button
                      key={b.id}
                      className="select"
                      style={{ cursor: 'pointer', background: beanId === b.id ? 'var(--bg2)' : 'white' }}
                      onClick={() => setBeanId(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
              <MarkdownPanel
                src={beanCardSrc}
                placeholder="请从左侧选择具体豆子"
              />
            </>
          )}

          {/* ── 杯测反馈 ── */}
          {tab === 'cupping' && (
            <>
              {manifest?.cupping?.length > 0 && (
                <div className="file-list" style={{ marginBottom: 16 }}>
                  {[...manifest.cupping].reverse().map(name => (
                    <div
                      key={name}
                      className={`file-item ${selectedCupping === name ? 'active' : ''}`}
                      onClick={() => setSelectedCupping(name)}
                    >
                      <span>{name.replace('cupping_', '杯测 ').replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>→</span>
                    </div>
                  ))}
                </div>
              )}
              <MarkdownPanel src={cuppingSrc} placeholder="请从上方选择杯测记录" />
            </>
          )}

          {/* ── 复盘小结 ── */}
          {tab === 'analysis' && (
            <>
              {manifest?.analysis?.length > 0 && (
                <div className="file-list" style={{ marginBottom: 16 }}>
                  {[...manifest.analysis].reverse().map(name => (
                    <div
                      key={name}
                      className={`file-item ${selectedAnalysis === name ? 'active' : ''}`}
                      onClick={() => setSelectedAnalysis(name)}
                    >
                      <span>{name.replace(/_analysis$/, '').replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>→</span>
                    </div>
                  ))}
                </div>
              )}
              <MarkdownPanel src={analysisSrc} placeholder="请从上方选择分析报告" />
            </>
          )}

        </div>
      </div>
    </div>
  )
}
