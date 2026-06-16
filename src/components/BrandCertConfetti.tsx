import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const CONFETTI_COLORS = [
  '#ff6b6b', '#ffa94d', '#9e5fff', '#51cf66', '#339af0', '#f494ff', '#e64980', '#fcc419',
] as const

const CONFETTI_RUN_MS = 3600

type ConfettiPiece = {
  id: number
  left: string
  delay: string
  duration: string
  color: string
  width: number
  height: number
  drift: string
  spin: string
  shape: 'square' | 'rect' | 'circle'
}

function buildPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => {
    const shapeRoll = id % 5
    const shape: ConfettiPiece['shape'] =
      shapeRoll === 0 ? 'circle' : shapeRoll === 1 ? 'rect' : 'square'
    const size = 5 + (id % 7)
    return {
      id,
      left: `${(id * 17.3) % 100}%`,
      delay: `${(id % 10) * 0.12}s`,
      duration: `${2.2 + (id % 4) * 0.25}s`,
      color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      width: shape === 'rect' ? size * 0.45 : size,
      height: shape === 'rect' ? size * 1.4 : size,
      drift: `${-28 + (id % 9) * 7}px`,
      spin: `${180 + (id % 4) * 180}deg`,
      shape,
    }
  })
}

export function BrandCertConfetti() {
  const pieces = useMemo(() => buildPieces(48), [])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), CONFETTI_RUN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="bc-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={
            'bc-confetti__piece' + (piece.shape === 'circle' ? ' bc-confetti__piece--circle' : '')
          }
          style={
            {
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              backgroundColor: piece.color,
              width: piece.width,
              height: piece.height,
              '--bc-confetti-drift': piece.drift,
              '--bc-confetti-spin': piece.spin,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
