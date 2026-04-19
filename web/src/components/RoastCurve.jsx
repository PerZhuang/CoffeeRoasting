import React, { useEffect, useState, useRef } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label
} from 'recharts'
import { loadKlog } from '../utils/dataLoader.js'
import { parseKlog, extractMeta } from '../utils/parseKlog.js'

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-time">⏱ {fmtTime(label)}</div>
      {payload.map(p => (
        <div key={p.name} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span style={{ color: 'var(--text2)', minWidth: 52 }}>{p.name}</span>
          <span style={{ color: p.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : '—'}
            {p.name === 'ROR' ? ' °/m' : ' °C'}
          </span>
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
        const sampled = rows
          .filter((_, i) => i % 3 === 0)
          .map(r => ({
            time:   Math.round(r.time),
            豆温:   r.mean_temp   != null ? +r.mean_temp.toFixed(1)   : null,
            目标:   r.profile     != null ? +r.profile.toFixed(1)     : null,
            ROR:    r.actual_ROR  != null ? +r.actual_ROR.toFixed(1)  : null,
          }))
        const result = { data: sampled, meta: extractMeta(meta), fc: firstCrack }
        cache.current[klogName] = result
        setState({ status: 'done', ...result })
      })
      .catch(err => {
        console.error('klog load error:', err)
        setState({ status: 'error', data: null, meta: null, fc: null })
      })
  }, [klogName])

  if (!klogName)
    return (
      <div className="empty" style={{ padding: '50px 20px' }}>
        <div className="empty-icon">📈</div>
        <div className="empty-text">从左侧选择烘焙炉次</div>
      </div>
    )

  if (state.status === 'loading' || (state.status === 'idle'))
    return <div className="loading" style={{ padding: '50px 20px' }}>加载曲线数据中…</div>

  if (state.status === 'error')
    return (
      <div className="empty" style={{ padding: '50px 20px' }}>
        <div className="empty-icon">⚠️</div>
        <div className="empty-text">曲线数据加载失败</div>
      </div>
    )

  if (!state.data)
    return <div className="loading" style={{ padding: '50px 20px' }}>处理数据中…</div>

  const { data, meta, fc } = state

  return (
    <>
      {/* Header inside card */}
      <div className="curve-card-header">
        <span className="curve-card-title">{meta?.profileName || klogName}</span>
        <span className="curve-card-date">{meta?.date}</span>
        {fc && (
          <span className="fc-badge">
            🔥 一爆 {fc.temp?.toFixed(1)}°C @ {fmtTime(fc.time)}
          </span>
        )}
        <div className="curve-legend">
          <div className="legend-item">
            <div className="legend-line" style={{ background: 'var(--temp-color)' }} />
            <span>豆温</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: 'var(--profile-color)', borderTop: '2px dashed var(--profile-color)', height: 0 }} />
            <span>目标曲线</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: 'var(--ror-color)' }} />
            <span>ROR</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 6, right: 54, bottom: 20, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

            <XAxis
              dataKey="time"
              tickFormatter={fmtTime}
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            >
              <Label value="时间" position="insideBottom" offset={-10}
                style={{ fontSize: 10, fill: 'var(--text3)' }} />
            </XAxis>

            <YAxis
              yAxisId="temp"
              domain={[20, 230]}
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}°`}
            />
            <YAxis
              yAxisId="ror"
              orientation="right"
              domain={[-20, 120]}
              tick={{ fontSize: 10, fill: 'var(--text3)' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'ROR', angle: 90, position: 'insideRight',
                       offset: 14, style: { fontSize: 10, fill: 'var(--ror-color)' } }}
            />

            <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'var(--border2)', strokeWidth: 1 }} />

            {fc && (
              <ReferenceLine
                yAxisId="temp"
                x={Math.round(fc.time)}
                stroke="var(--accent)"
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                label={{ value: '一爆', position: 'insideTopRight',
                         fontSize: 10, fill: 'var(--accent)' }}
              />
            )}

            {/* 目标曲线（最底层，灰色虚线） */}
            <Line
              yAxisId="temp" dataKey="目标"
              stroke="var(--profile-color)" strokeWidth={1.5}
              strokeDasharray="5 4" dot={false} connectNulls
            />
            {/* 豆温曲线（主角，橙色实线） */}
            <Line
              yAxisId="temp" dataKey="豆温"
              stroke="var(--temp-color)" strokeWidth={2.5}
              dot={false} activeDot={{ r: 4, fill: 'var(--temp-color)', stroke: 'var(--card)' }}
              connectNulls
            />
            {/* ROR（右轴，红色） */}
            <Line
              yAxisId="ror" dataKey="ROR"
              stroke="var(--ror-color)" strokeWidth={1.5}
              dot={false} activeDot={{ r: 3, fill: 'var(--ror-color)', stroke: 'var(--card)' }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
