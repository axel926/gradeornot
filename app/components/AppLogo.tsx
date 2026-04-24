import React from 'react'

export default function AppLogo({ size = 32 }: { size?: number }) {
  const s = size / 100
  const cw = 52 * s
  const ch = 72 * s
  const cx = (size - cw) / 2
  const cy = (size - ch) / 2
  const r = 6 * s
  const border = 3 * s
  const fontSize = 32 * s

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {/* Carte jaune */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={r} fill="#F5B731" />
      {/* Intérieur noir */}
      <rect x={cx + border} y={cy + border} width={cw - border*2} height={ch - border*2} rx={r * 0.7} fill="#1A1A1C" />
      {/* $ centré */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F5B731"
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="Helvetica, Arial, sans-serif"
      >$</text>
    </svg>
  )
}
