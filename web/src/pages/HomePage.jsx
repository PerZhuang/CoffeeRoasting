import React from 'react'
import { LogoFull } from '../components/Logo.jsx'

/* ── 每款豆子的视觉配置 ── */
const BEAN_VISUALS = {
  yunnan_puer_catimor_nat: {
    gradient: 'linear-gradient(145deg, #071a0e 0%, #0f2d18 45%, #183d22 100%)',
    accent: '#34d399',
    label: '中国 · 云南',
    flag: '🌿',
    CoverArt: YunnanArt,
  },
  panama_aurora_catuai_nat: {
    gradient: 'linear-gradient(145deg, #1a0c00 0%, #3b1f00 45%, #522c00 100%)',
    accent: '#f0a030',
    label: '巴拿马 · 火山',
    flag: '🌋',
    CoverArt: PanamaArt,
  },
}

const FALLBACK_VISUAL = {
  gradient: 'linear-gradient(145deg, #0f0d18 0%, #1e1830 100%)',
  accent: '#60a5fa',
  label: '产区未知',
  flag: '☕',
  CoverArt: DefaultArt,
}

/* ── 封面抽象艺术 ── */
function YunnanArt() {
  return (
    <svg viewBox="0 0 320 160" fill="none" preserveAspectRatio="xMidYMid slice"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      {/* 层叠山脉剪影 */}
      <path d="M-10 160 L40 100 L80 125 L130 65 L175 95 L220 40 L265 75 L310 30 L340 55 L340 160Z"
        fill="rgba(52,211,153,0.07)" />
      <path d="M-10 160 L30 120 L75 140 L120 85 L165 108 L210 55 L255 90 L300 45 L340 72 L340 160Z"
        fill="rgba(52,211,153,0.05)" />
      <path d="M-10 160 L20 135 L70 150 L115 100 L155 120 L200 75 L250 105 L295 65 L340 88 L340 160Z"
        fill="rgba(52,211,153,0.04)" />
      {/* 等高线 */}
      <ellipse cx="190" cy="55" rx="90" ry="28" stroke="rgba(52,211,153,0.12)" strokeWidth="1" fill="none"/>
      <ellipse cx="190" cy="55" rx="60" ry="18" stroke="rgba(52,211,153,0.1)" strokeWidth="1" fill="none"/>
      <ellipse cx="190" cy="55" rx="32" ry="10" stroke="rgba(52,211,153,0.09)" strokeWidth="1" fill="none"/>
      {/* 散点装饰 */}
      {[60,90,130,170,220,260,300].map((x,i) => (
        <circle key={i} cx={x} cy={145 - (i%3)*8} r="1.5"
          fill="rgba(52,211,153,0.25)" />
      ))}
    </svg>
  )
}

function PanamaArt() {
  return (
    <svg viewBox="0 0 320 160" fill="none" preserveAspectRatio="xMidYMid slice"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      {/* 火山锥轮廓 */}
      <path d="M160 20 L240 160 L80 160Z" fill="rgba(240,160,48,0.06)" />
      <path d="M160 35 L225 160 L95 160Z" fill="rgba(240,160,48,0.05)" />
      {/* 等高线（同心椭圆） */}
      <ellipse cx="160" cy="105" rx="120" ry="40" stroke="rgba(240,160,48,0.1)" strokeWidth="1" fill="none"/>
      <ellipse cx="160" cy="90"  rx="90"  ry="30" stroke="rgba(240,160,48,0.1)" strokeWidth="1" fill="none"/>
      <ellipse cx="160" cy="76"  rx="62"  ry="21" stroke="rgba(240,160,48,0.09)" strokeWidth="1" fill="none"/>
      <ellipse cx="160" cy="64"  rx="38"  ry="13" stroke="rgba(240,160,48,0.08)" strokeWidth="1" fill="none"/>
      <ellipse cx="160" cy="52"  rx="18"  ry="7"  stroke="rgba(240,160,48,0.08)" strokeWidth="1" fill="none"/>
      {/* 热带植被点 */}
      {[30,70,110,200,250,290].map((x,i) => (
        <line key={i} x1={x} y1="155" x2={x + (i%2?3:-3)} y2="140"
          stroke="rgba(240,160,48,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </svg>
  )
}

function DefaultArt() {
  return (
    <svg viewBox="0 0 320 160" fill="none"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <circle cx="160" cy="80" r="60" stroke="rgba(96,165,250,0.1)" strokeWidth="1"/>
      <circle cx="160" cy="80" r="40" stroke="rgba(96,165,250,0.08)" strokeWidth="1"/>
      <circle cx="160" cy="80" r="20" stroke="rgba(96,165,250,0.06)" strokeWidth="1"/>
    </svg>
  )
}

/* ── 单张生豆卡片 ── */
function BeanCard({ id, name, variety, process, altitude, roastCount, bestScore, versions, visual, onClick }) {
  const { gradient, accent, label, flag, CoverArt } = visual

  return (
    <div className="bean-card" onClick={onClick}
      style={{ '--card-accent': accent }}>
      {/* 封面 */}
      <div className="bean-card-cover" style={{ background: gradient }}>
        <CoverArt />
        <div className="bean-card-cover-meta">
          <span className="bean-card-flag">{flag}</span>
          <span className="bean-card-region">{label}</span>
        </div>
        <div className="bean-card-cover-altitude">
          <span>{altitude}</span>
        </div>
      </div>

      {/* 信息体 */}
      <div className="bean-card-body">
        <h2 className="bean-card-name">{name}</h2>
        <div className="bean-card-specs">
          <span className="spec-pill">{variety}</span>
          <span className="spec-pill">{process}</span>
        </div>
        <div className="bean-card-footer">
          <div className="bean-card-stat">
            <span className="bstat-val" style={{ color: accent }}>
              {bestScore ?? '—'}
            </span>
            <span className="bstat-label">最高杯测</span>
          </div>
          <div className="bean-card-stat">
            <span className="bstat-val">{roastCount}</span>
            <span className="bstat-label">炉次</span>
          </div>
          <div className="bean-card-stat">
            <span className="bstat-val">{versions}</span>
            <span className="bstat-label">版本</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 首页 ── */
export default function HomePage({ roasts, beans, onSelectBean }) {
  // 为每款豆子计算统计
  const beanStats = beans.map(b => {
    const rows = roasts.filter(r =>
      r.green_bean?.toLowerCase().includes(b.filterKey.toLowerCase())
    )
    const scores = rows.map(r => parseFloat(r.cupping_score)).filter(Boolean)
    const versions = [...new Set(rows.map(r => r.profile_version).filter(Boolean))]
    return {
      ...b,
      roastCount: rows.length,
      bestScore: scores.length ? Math.max(...scores) : null,
      versions: versions.length ? `v1–v${versions.length}` : '—',
      visual: BEAN_VISUALS[b.id] || FALLBACK_VISUAL,
    }
  })

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <LogoFull />
        <div className="home-header-stats">
          <div className="hstat">
            <div className="hstat-val">{roasts.length}</div>
            <div className="hstat-label">总炉次</div>
          </div>
          <div className="hstat">
            <div className="hstat-val">{beans.length}</div>
            <div className="hstat-label">豆种</div>
          </div>
        </div>
      </header>

      {/* Hero text */}
      <div className="home-hero">
        <h1 className="home-title">烘焙实验室</h1>
        <p className="home-subtitle">选择豆种，开始探索完整的烘焙历程</p>
      </div>

      {/* Bean card grid */}
      <div className="bean-grid">
        {beanStats.map(b => (
          <BeanCard
            key={b.id}
            {...b}
            onClick={() => onSelectBean(b.id)}
          />
        ))}
      </div>
    </div>
  )
}
