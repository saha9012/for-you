import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  prevX: number
  prevY: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  drag: number
  gravity: number
  sparkle: number
}

type Rocket = {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
  exploded: boolean
}

const PALETTES = [
  ['#fff8db', '#ffd86b', '#eaa629'],
  ['#f7f4ff', '#bca7ff', '#7864ff'],
  ['#effcff', '#83efff', '#2cb9df'],
  ['#fff2f7', '#ff9fc5', '#ff578e'],
] as const

type Props = {
  intensity?: number
  continuous?: boolean
  openingCount?: number
  showRocketTrails?: boolean
  persistentTrails?: boolean
  className?: string
}

export function Fireworks({
  intensity = 1,
  continuous = false,
  openingCount = 3,
  showRocketTrails = true,
  persistentTrails = true,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const particles: Particle[] = []
    const rockets: Rocket[] = []
    let spawnTimer = 44

    const resize = () => {
      // 1.5 keeps the canvas sharp while avoiding a 4x pixel cost on Retina screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const burst = (x: number, y: number, color: string) => {
      const palette = PALETTES.find((item) => item.includes(color as never)) ?? PALETTES[0]
      const count = Math.floor((62 + Math.random() * 34) * intensity)
      const spokes = 18 + Math.floor(Math.random() * 12)
      for (let i = 0; i < count; i++) {
        const spoke = i % spokes
        const angle = (Math.PI * 2 * spoke) / spokes + (Math.random() - 0.5) * 0.075
        const speed = 1.6 + Math.random() * 4.8
        particles.push({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1.1 + Math.random() * 1.15,
          size: 0.65 + Math.random() * 1.35,
          color: palette[(Math.random() * palette.length) | 0],
          drag: 0.976 + Math.random() * 0.012,
          gravity: 0.018 + Math.random() * 0.024,
          sparkle: Math.random() * Math.PI * 2,
        })
      }

      // Fine glitter floating after every main burst.
      for (let i = 0; i < 18 * intensity; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.4 + Math.random() * 2.6
        particles.push({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1.5 + Math.random() * 1.4,
          size: 0.45 + Math.random() * 0.75,
          color: '#ffffff',
          drag: 0.987,
          gravity: 0.012,
          sparkle: Math.random() * Math.PI * 2,
        })
      }
    }

    const launch = () => {
      const palette = PALETTES[(Math.random() * PALETTES.length) | 0]
      const color = palette[1]
      rockets.push({
        x: window.innerWidth * (0.12 + Math.random() * 0.76),
        y: window.innerHeight + 10,
        vy: -(8.8 + Math.random() * 3.2),
        targetY: window.innerHeight * (0.12 + Math.random() * 0.37),
        color,
        exploded: false,
      })
    }

    const tick = () => {
      if (!running) return
      if (persistentTrails) {
        ctx.fillStyle = continuous ? 'rgba(3, 4, 10, 0.14)' : 'rgba(3, 4, 10, 0.2)'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }

      spawnTimer--
      if (spawnTimer <= 0) {
        const n = continuous ? 1 : 1 + Math.floor(Math.random() * 2 * intensity)
        for (let i = 0; i < n; i++) launch()
        spawnTimer = continuous ? 42 + Math.random() * 46 : 18 + Math.random() * 22
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y += r.vy
        r.vy += 0.045
        if (showRocketTrails) {
          const trail = ctx.createLinearGradient(r.x, r.y, r.x, r.y + 54)
          trail.addColorStop(0, r.color)
          trail.addColorStop(1, 'transparent')
          ctx.strokeStyle = trail
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(r.x, r.y)
          ctx.lineTo(r.x, r.y + 54)
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.fillStyle = '#fff'
        ctx.shadowBlur = 22
        ctx.shadowColor = r.color
        ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        if (!r.exploded && (r.y <= r.targetY || r.vy >= -0.5)) {
          r.exploded = true
          burst(r.x, r.y, r.color)
          rockets.splice(i, 1)
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.prevX = p.x
        p.prevY = p.y
        p.vx *= p.drag
        p.vy *= p.drag
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.016 / p.maxLife

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const flicker = 0.55 + Math.sin(performance.now() * 0.018 + p.sparkle) * 0.45
        ctx.globalAlpha = Math.max(p.life, 0) * (0.55 + flicker * 0.45)
        ctx.strokeStyle = p.color
        ctx.lineWidth = Math.max(0.45, p.size * p.life)
        // Shadows are the most expensive canvas operation; a few bright
        // particles provide the same glow without applying blur to every spark.
        const glowing = p.size > 1.45 && i % 7 === 0
        ctx.shadowColor = glowing ? p.color : 'transparent'
        ctx.shadowBlur = glowing ? 5 : 0
        ctx.beginPath()
        ctx.moveTo(p.prevX, p.prevY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    // opening salvo
    const openingTimers: number[] = []
    for (let i = 0; i < openingCount; i++) {
      openingTimers.push(window.setTimeout(launch, i * 320))
    }
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      openingTimers.forEach(window.clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [intensity, continuous, openingCount, showRocketTrails, persistentTrails])

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
