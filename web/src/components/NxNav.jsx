import React from 'react'

const NAV_LINKS = [
  { id: 'home',     label: '首页' },
  { id: 'library',  label: '我的豆库' },
  { id: 'roasts',   label: '炉次' },
  { id: 'insights', label: '数据洞察' },
  { id: 'cupping',  label: '杯测' },
]

export default function NxNav({ page, onNavigate, mode = 'page' }) {
  return (
    <nav className={`nx-nav ${mode === 'hero' ? 'nx-nav-hero' : 'nx-nav-solid'}`}>
      <div className="nx-nav-brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="11" stroke="#1ed760" strokeWidth="1.8"/>
          <path d="M5 14 Q9 7 14 11 T23 14" stroke="#1ed760" strokeWidth="2"/>
          <circle cx="14" cy="14" r="2.2" fill="#1ed760"/>
        </svg>
        <span className="nx-nav-wordmark">COX·LAB</span>
      </div>
      <div className="nx-nav-links">
        {NAV_LINKS.map(link => (
          <span key={link.id}
                className={`nx-nav-link ${page === link.id ? 'nx-nav-link-active' : ''}`}
                onClick={() => onNavigate(link.id)}>
            {link.label}
          </span>
        ))}
      </div>
      <div className="nx-nav-right">
        <span style={{ fontSize: 18, opacity: 0.7 }}>🔍</span>
        <div className="nx-avatar">P</div>
      </div>
    </nav>
  )
}
