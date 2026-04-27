import React from 'react'

/** GAURI 品牌 Logo — 高黎贡山 + 怒江 图形标 */
export function LogoIcon({ size = 28, color = '#f0a030' }) {
  return (
    <svg
      width={size}
      height={size * 1.14}
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 瓶颈 */}
      <rect x="10" y="1" width="8" height="9" rx="1.5"
        stroke={color} strokeWidth="1.7" fill="none" />
      {/* 瓶颈到瓶身的斜肩 */}
      <line x1="10" y1="10" x2="4.5" y2="18"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="18" y1="10" x2="23.5" y2="18"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      {/* 瓶身（弧形底部）*/}
      <path d="M4.5 18 C2.5 22.5 3.5 27.5 7.5 29.8 C10 31.2 18 31.2 20.5 29.8 C24.5 27.5 25.5 22.5 23.5 18"
        stroke={color} strokeWidth="1.7" strokeLinecap="round"
        fill={color} fillOpacity="0.08" />
      {/* 液面线 */}
      <path d="M7 22.5 Q14 20 21 22.5"
        stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      {/* 气泡 */}
      <circle cx="11.5" cy="26" r="1.4" fill={color} />
      <circle cx="16.5" cy="25" r="1" fill={color} fillOpacity="0.7" />
      <circle cx="20" cy="27" r="0.9" fill={color} fillOpacity="0.45" />
    </svg>
  )
}

/** 完整 wordmark：图形 + 文字 */
export function LogoFull({ className = '' }) {
  return (
    <div className={`logo-full ${className}`}>
      <LogoIcon size={28} />
      <div className="logo-wordmark">
        <span className="logo-name">GAURI</span>
        <span className="logo-tagline">Roast Intelligence</span>
      </div>
    </div>
  )
}
