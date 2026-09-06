import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  z: number
  size: number
  twinkle: number
  speed: number
  flare: boolean
}

type Props = {
  density?: number
  className?: string
}

export function Starfield({ density = 1, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    const stars: Star[] = []

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor(150 * density + (w * h) / 12000)
      stars.length = 0
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.2 + Math.random() * 0.8,
          size: 0.45 + Math.random() * 1.65,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.00018 + Math.random() * 0.00034,
          flare: Math.random() > 0.93,
        })
      }
    }

    const tick = (t: number) => {
      if (!running) return
      ctx.clearRect(0, 0, w, h)

      for (const s of stars) {
        s.y += 0.025 * s.z
        if (s.y > h + 4) {
          s.y = -4
          s.x = Math.random() * w
        }
        const a = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * s.speed + s.twinkle))
        ctx.globalAlpha = a * (0.35 + s.z * 0.65)
        ctx.fillStyle = s.z > 0.7 ? '#ffe7a3' : '#dff8ff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * s.z, 0, Math.PI * 2)
        ctx.fill()

        if (s.flare && a > 0.72) {
          const ray = s.size * 4.8 * s.z * a
          ctx.globalAlpha = (a - 0.7) * 0.6
          ctx.strokeStyle = s.z > 0.7 ? '#ffe7a3' : '#dff8ff'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(s.x - ray, s.y)
          ctx.lineTo(s.x + ray, s.y)
          ctx.moveTo(s.x, s.y - ray)
          ctx.lineTo(s.x, s.y + ray)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    rebuild()
    window.addEventListener('resize', rebuild)
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', rebuild)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
