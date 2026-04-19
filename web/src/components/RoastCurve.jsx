import React, { useEffect, useState, useRef } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Label
} from 'recharts'
import { loadKlog } from '../utils/dataLoader.js'
import { parseKlog, extractMeta } from '../utils/parseKlog.js'

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>⏱ {fmtTime(label)}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name.includes('ROR') ? ' °C/min' : ' °C'}
        </div>
      ))}
    </div>
  )
}

export default function RoastCurve({ klogName }) {
  const [state, setState] = useState({ status: 'idle', data: null, meta: null, fc: null })
  const cache = useRef({})

  useEffect(() => {
    if (!klogName) return
    if (cache.current[klogName]) {
      setState({ status: 'done', ...cache.current[klogName] })
      return
    }
    setState({ status: 'loading', data: null, meta: null, fc: null })
    loadKlog(klogName)
      .then(text => {
        const { rows, meta, firstCrack } = parseKlog(text)
        // 降采样：每3秒取一个点（原始约1秒一点）
        const sampled = rows.filter((_, i) => i % 3 === 0).map(r => ({
          time:     Math.round(r.time),
          豆温:     +r.mean_temp?.toFixed(1),
          目标曲线: +r.profile?.toFixed(1),
          ROR:      +r.actual_ROR?.toFixed(1),
        }))
        const result = { data: sampled, meta: extractMeta(meta), fc: firstCrack }
        cache.current[klogName] = result
        setState({ status: 'done', ...result })
      })
      .catch(() => setState({ status: 'error', data: null, meta: null, fc: null }))
  }, [klogName])

  if (!klogName)
    return <div className="empty"><div className="empty-icon">📈</div>点击左侧烘焙记录查看曲线</div>

  if (state.status === 'loading')
    return <div className="loading">加载曲线数据中…</div>

  if (state.status === 'error')
    return <div className="empty"><div className="empty-icon">⚠️</div>曲线数据加载失败</div>

  // idle 或 data 未就绪时显示加载中，避免访问 null.length 崩溃
  if (!state.data)
    return <div className="loading">加载中…</div>

  const { data, meta, fc } = state
  const totalTime = data[data.length - 1]?.time || 0
  const endTemp = data[data.length - 1]?.豆温 || 0

  return (
    <div className="curve-container">
      <div className="curve-header">
        <span className="curve-title">{meta?.profileName || klogName}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{meta?.date}</span>
        {fc && (
          <span className="fc-marker">
            🔥 一爆 {fc.temp?.toFixed(1)}°C @ {fmtTime(fc.time)}
          </span>
        )}
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--temp)', height: 3 }} />豆温
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--profile)', height: 2 }} />目标曲线
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--ror)' }} />ROR
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 8, right: 50, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0e8df" />
          <XAxis
            dataKey="time"
            tickFormatter={fmtTime}
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11 }}
          >
            <Label value="时间" position="insideBottom" offset={-10} style={{ fontSize: 11, fill: 'var(--text2)' }} />
          </XAxis>

          {/* 左轴：温度 */}
          <YAxis yAxisId="temp" domain={[0, 230]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}°`} />
          {/* 右轴：ROR */}
          <YAxis yAxisId="ror" orientation="right" domain={[-30, 130]}
            tick={{ fontSize: 11 }} tickFormatter={v => `${v}`}
            label={{ value: 'ROR', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11, fill: 'var(--ror)' } }} />

          <Tooltip content={<CustomTooltip />} />

          {fc && (
            <ReferenceLine yAxisId="temp" x={Math.round(fc.time)}
              stroke="var(--warn)" strokeDasharray="4 2"
              label={{ value: '一爆', position: 'insideTopRight', fontSize: 11, fill: 'var(--warn)' }} />
          )}

          <Line yAxisId="temp" dataKey="目标曲线" stroke="var(--profile)"
            strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          <Line yAxisId="temp" dataKey="豆温" stroke="var(--temp)"
            strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line yAxisId="ror" dataKey="ROR" stroke="var(--ror)"
            strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 统计摘要 */}
      <div className="stat-grid" style={{ marginTop: 12 }}>
        <div className="stat">
          <div className="stat-label">总时间</div>
          <div className="stat-value">{fmtTime(totalTime)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">出豆温度</div>
          <div className="stat-value">{endTemp}<span className="stat-unit">°C</span></div>
        </div>
        {fc && <>
          <div className="stat">
            <div className="stat-label">一爆温度</div>
            <div className="stat-value">{fc.temp?.toFixed(1)}<span className="stat-unit">°C</span></div>
          </div>
          <div className="stat">
            <div className="stat-label">一爆时间</div>
            <div className="stat-value">{fmtTime(fc.time)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">发展时间</div>
            <div className="stat-value">{fmtTime(totalTime - fc.time)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">目标一爆</div>
            <div className="stat-value">{meta?.expectFc}<span className="stat-unit">°C</span></div>
          </div>
        </>}
      </div>
    </div>
  )
}
