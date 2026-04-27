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
      <div className="nx-nav-brand" onClick={() => onNavigate('home')}
           style={{ cursor: 'pointer' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {/* Gaoligong mountain silhouette */}
          <path d="M1 26 L10 5 L16 14 L22 7 L27 26Z" fill="#ffffff"/>
          {/* Nu River — two horizontal green lines */}
          <line x1="1" y1="20" x2="27" y2="20" stroke="#1ed760" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="1" y1="23" x2="27" y2="23" stroke="#1ed760" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="nx-nav-wordmark">GAURI</span>
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
    </nav>
  )
}
