import React from 'react'

export default function V60Icon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6 L20 6 L13.5 16 L10.5 16 Z"/>
      <path d="M9 9 L15 9"/>
      <path d="M12 19 L12 21"/>
      <path d="M10 21 L14 21"/>
    </svg>
  )
}
