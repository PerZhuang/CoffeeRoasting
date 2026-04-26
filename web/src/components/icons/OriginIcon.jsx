import React from 'react'

export default function OriginIcon({ kind, size = 16, color = 'currentColor' }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.7' }

  if (kind === 'yunnan') return (
    <svg {...props}>
      <path d="M2 20 L7 11 L10 15 L14 8 L18 13 L22 20Z"/>
      <circle cx="18" cy="6" r="2"/>
    </svg>
  )

  if (kind === 'panama') return (
    <svg {...props}>
      <path d="M3 20 L10 8 L12 6 L14 8 L21 20Z"/>
      <path d="M10 6 Q9 3 11 2"/>
    </svg>
  )

  if (kind === 'ethiopia') return (
    <svg {...props}>
      <circle cx="18" cy="6" r="2.5"/>
      <path d="M2 20 L7 14 L11 17 L16 12 L22 20Z"/>
    </svg>
  )

  if (kind === 'colombia') return (
    <svg {...props}>
      <circle cx="12" cy="6" r="2.5"/>
      <path d="M4 20 Q8 14 12 16 Q16 14 20 20Z"/>
      <path d="M7 20 Q9 17 12 18 Q15 17 17 20"/>
    </svg>
  )

  return null
}
