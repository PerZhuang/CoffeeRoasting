import React from 'react'

const COLS = [
  { key: 'roast_id',       label: '#' },
  { key: 'date',           label: '日期' },
  { key: 'profile_version',label: '版本' },
  { key: 'actual_fc_temp', label: '一爆℃' },
  { key: 'actual_fc_time_s',label: '一爆s' },
  { key: 'dev_pct',        label: '发展比' },
  { key: 'roast_end_temp', label: '出豆℃' },
  { key: 'total_time_s',   label: '总时s' },
  { key: 'weight_loss_pct',label: '失重' },
  { key: 'cupping_score',  label: '杯测' },
]

function score2badge(s) {
  const n = parseFloat(s)
  if (!n) return null
  if (n >= 8) return 'badge-green'
  if (n >= 6) return 'badge-orange'
  return 'badge-red'
}

export default function RoastLogTable({ rows, selectedId, onSelect, beanFilter }) {
  const filtered = beanFilter
    ? rows.filter(r => r.green_bean?.toLowerCase().includes(beanFilter.toLowerCase()))
    : rows

  if (!filtered.length)
    return <div className="empty"><div className="empty-icon">📋</div>暂无烘焙记录</div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLS.map(c => <th key={c.key}>{c.label}</th>)}
            <th>豆子</th>
            <th>主要风味</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(row => {
            const cls = score2badge(row.cupping_score)
            return (
              <tr
                key={row.roast_id}
                className={selectedId === row.roast_id ? 'selected' : ''}
                onClick={() => onSelect(row)}
              >
                {COLS.map(c => (
                  <td key={c.key}>
                    {c.key === 'cupping_score' && cls
                      ? <span className={`badge ${cls}`}>{row[c.key]}</span>
                      : row[c.key] || '—'}
                  </td>
                ))}
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.green_bean || '—'}
                </td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text2)', fontSize: 12 }}>
                  {row.flavor_notes || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
