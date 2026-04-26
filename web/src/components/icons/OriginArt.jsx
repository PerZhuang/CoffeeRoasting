import React from 'react'

export default function OriginArt({ kind }) {
  const style = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }

  if (kind === 'yunnan') return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" fill="none" style={style}>
      <defs>
        <linearGradient id="ynSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0)"/>
          <stop offset="1" stopColor="rgba(255,255,255,0.12)"/>
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#ynSky)"/>
      <path d="M30 60 Q50 50 80 58 T140 55 T200 60" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      <path d="M220 75 Q260 65 300 72 T380 70" stroke="rgba(255,255,255,0.28)" strokeWidth="1"/>
      <path d="M0 140 L60 100 L110 120 L160 85 L220 110 L280 90 L340 115 L400 100 L400 260 L0 260Z"
            fill="rgba(0,0,0,0.35)"/>
      <path d="M-20 190 Q100 175 220 185 T440 180" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      <path d="M-20 210 Q100 198 220 205 T440 202" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
      <path d="M-20 230 Q100 220 220 226 T440 224" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      {[{x:70,s:1},{x:110,s:0.7},{x:310,s:0.9},{x:350,s:0.6}].map((t,i) => (
        <g key={i} transform={`translate(${t.x},${150-t.s*30}) scale(${t.s})`}>
          <path d="M0 50 L-8 30 L-4 30 L-10 12 L-5 12 L-12 -5 L0 -12 L12 -5 L5 12 L10 12 L4 30 L8 30 L0 50Z"
                fill="rgba(0,0,0,0.55)"/>
        </g>
      ))}
    </svg>
  )

  if (kind === 'panama') return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" fill="none" style={style}>
      <path d="M80 260 L160 80 L170 70 L180 80 L260 260Z" fill="rgba(0,0,0,0.4)"/>
      <path d="M160 80 L180 80 L200 110 L140 110Z" fill="rgba(240,160,48,0.4)"/>
      <path d="M165 70 Q155 50 170 40 T180 20" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
      <path d="M175 70 Q190 55 180 35 T195 15" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      <path d="M-10 230 Q80 225 160 230 T340 228 L420 230" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <g transform="translate(20,180) rotate(-12)">
        <path d="M0 0 Q40 -10 80 0" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
        {[10,25,40,55,70].map((x,i) => (
          <ellipse key={i} cx={x} cy={-3+(i%2)*6} rx="8" ry="3" fill="rgba(255,255,255,0.25)"
                   transform={`rotate(${(i%2)*30-15} ${x} ${-3+(i%2)*6})`}/>
        ))}
        {[20,50].map((x,i) => (
          <circle key={i} cx={x} cy="4" r="2.5" fill="rgba(240,160,48,0.7)"/>
        ))}
      </g>
    </svg>
  )

  if (kind === 'ethiopia') return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" fill="none" style={style}>
      <circle cx="320" cy="80" r="32" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      <circle cx="320" cy="80" r="20" fill="rgba(255,255,255,0.15)"/>
      <path d="M0 180 L80 150 L160 170 L240 140 L320 160 L400 145 L400 260 L0 260Z"
            fill="rgba(0,0,0,0.3)"/>
      <path d="M0 210 L100 190 L200 205 L300 185 L400 198 L400 260 L0 260Z"
            fill="rgba(0,0,0,0.45)"/>
      {[{x:40,y:175,r:8},{x:65,y:170,r:10},{x:90,y:178,r:7},{x:200,y:165,r:9},{x:225,y:160,r:11},
        {x:250,y:168,r:8},{x:350,y:170,r:9},{x:375,y:175,r:7}].map((t,i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="rgba(0,0,0,0.5)"/>
      ))}
      <path d="M140 60 Q148 54 156 60 Q164 54 172 60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
      <path d="M180 75 Q186 70 192 75" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    </svg>
  )

  if (kind === 'colombia') return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" fill="none" style={style}>
      {/* Sun */}
      <circle cx="60" cy="55" r="24" fill="rgba(212,120,58,0.4)"/>
      <circle cx="60" cy="55" r="16" fill="rgba(212,120,58,0.55)"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i}
              x1={60 + Math.cos(a*Math.PI/180)*20} y1={55 + Math.sin(a*Math.PI/180)*20}
              x2={60 + Math.cos(a*Math.PI/180)*30} y2={55 + Math.sin(a*Math.PI/180)*30}
              stroke="rgba(212,120,58,0.5)" strokeWidth="1.5"/>
      ))}
      {/* Rolling hills */}
      <path d="M0 200 Q80 165 160 180 Q240 195 320 165 Q370 148 400 155 L400 260 L0 260Z"
            fill="rgba(0,0,0,0.38)"/>
      <path d="M0 225 Q100 210 200 218 Q300 226 400 214 L400 260 L0 260Z"
            fill="rgba(0,0,0,0.50)"/>
      {/* Coffee branch */}
      <g transform="translate(290,160)">
        <path d="M0 0 Q30 -8 60 -2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
        {[8,20,32,44,56].map((x,i) => (
          <ellipse key={i} cx={x} cy={-3+(i%2)*8} rx="9" ry="3.5" fill="rgba(255,255,255,0.22)"
                   transform={`rotate(${(i%2)*35-17} ${x} ${-3+(i%2)*8})`}/>
        ))}
        {[15,35,52].map((x,i) => (
          <circle key={i} cx={x} cy={4+(i%2)*3} r="2.8" fill="rgba(212,120,58,0.8)"/>
        ))}
      </g>
      {/* Mist lines */}
      <path d="M-10 145 Q100 138 220 142 T420 138" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
      <path d="M-10 160 Q120 154 240 158 T420 154" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
    </svg>
  )

  return null
}
