import { useEffect, useRef, useState } from 'react'
import { GAME } from '../config'
import { Starfield } from './Starfield'
import './OrbitGame.css'

type Props = {
  onWin: () => void
}

type Entity = {
  id: number
  x: number
  y: number
  r: number
  vx: number
  vy: number
  kind: 'signal' | 'noise'
  pulse: number
}

function drawFallingStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  glow: number,
) {
  const tail = ctx.createLinearGradient(x, y, x, y - radius * 4.8)
  tail.addColorStop(0, `rgba(255, 92, 122, ${0.55 + glow * 0.35})`)
  tail.addColorStop(1, 'rgba(255, 92, 122, 0)')
  ctx.strokeStyle = tail
  ctx.lineWidth = Math.max(1, radius * 0.18)
  ctx.beginPath()
  ctx.moveTo(x, y - radius * 0.5)
  ctx.lineTo(x, y - radius * 4.8)
  ctx.stroke()

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  for (let point = 0; point < 10; point++) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5
    const pointRadius = point % 2 === 0 ? radius : radius * 0.42
    const px = Math.cos(angle) * pointRadius
    const py = Math.sin(angle) * pointRadius
    if (point === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = `rgba(255, ${105 + glow * 40}, ${136 + glow * 40}, 0.95)`
  ctx.shadowColor = '#ff416d'
  ctx.shadowBlur = 14
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255, 240, 244, 0.88)'
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function OrbitGame({ onWin }: Props) {
  const playRef = useRef<HTMLDivElement>(null)
  const shipX = useRef(0.5)
  const entities = useRef<Entity[]>([])
  const scoreRef = useRef(0)
  const idRef = useRef(0)
  const wonRef = useRef(false)
  const failedRef = useRef(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(GAME.durationSec)
  const [shipPct, setShipPct] = useState(50)
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null)
  const [ticker, setTicker] = useState('+0.00 ♥')
  const [failed, setFailed] = useState(false)
  const [runId, setRunId] = useState(0)
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    const el = playRef.current
    if (!el) return

    const setFromClientX = (clientX: number) => {
      const rect = el.getBoundingClientRect()
      const t = (clientX - rect.left) / rect.width
      shipX.current = Math.min(0.92, Math.max(0.08, t))
      setShipPct(shipX.current * 100)
    }

    const onPointer = (e: PointerEvent) => setFromClientX(e.clientX)
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) setFromClientX(e.touches[0].clientX)
    }

    el.addEventListener('pointermove', onPointer)
    el.addEventListener('pointerdown', onPointer)
    el.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      el.removeEventListener('pointermove', onPointer)
      el.removeEventListener('pointerdown', onPointer)
      el.removeEventListener('touchmove', onTouch)
    }
  }, [])

  useEffect(() => {
    if (ready) return

    let remaining = 4
    const id = window.setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
        setReady(true)
      }
    }, 1000)

    return () => window.clearInterval(id)
  }, [ready, runId])

  useEffect(() => {
    const el = playRef.current
    if (!el) return

    let raf = 0
    let last = performance.now()
    let spawnAcc = 0
    let running = true

    const spawn = (w: number) => {
      const kind: Entity['kind'] = Math.random() > 0.28 ? 'signal' : 'noise'
      entities.current.push({
        id: idRef.current++,
        x: 40 + Math.random() * Math.max(40, w - 80),
        y: -20,
        r: kind === 'signal' ? 10 + Math.random() * 6 : 12 + Math.random() * 8,
        vx: kind === 'noise' ? (Math.random() - 0.5) * 0.75 : 0,
        vy:
          kind === 'signal'
            ? 1.6 + Math.random() * 2.2 + scoreRef.current * 0.05
            : 4.8 + Math.random() * 2.8 + scoreRef.current * 0.06,
        kind,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const frame = (now: number) => {
      if (!running) return
      if (!ready || failedRef.current || wonRef.current) {
        raf = requestAnimationFrame(frame)
        return
      }
      const dt = Math.min(32, now - last)
      last = now
      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const shipY = h - 56
      const shipPx = shipX.current * w

      spawnAcc += dt
      const spawnEvery = Math.max(320, 780 - scoreRef.current * 25)
      if (spawnAcc >= spawnEvery) {
        spawnAcc = 0
        spawn(w)
      }

      const next: Entity[] = []
      for (const e of entities.current) {
        e.x += e.vx * (dt / 16)
        e.y += e.vy * (dt / 16)
        e.pulse += e.kind === 'noise' ? 0.16 : 0.08
        const dx = e.x - shipPx
        const dy = e.y - shipY
        const hit = Math.hypot(dx, dy) < e.r + 18

        if (hit) {
          if (e.kind === 'signal') {
            scoreRef.current += 1
            setScore(scoreRef.current)
            setFlash('good')
            setTicker(`+${(Math.random() * 9 + 1).toFixed(2)} ♥`)
            window.setTimeout(() => setFlash(null), 720)
            if (scoreRef.current >= GAME.targetScore && !wonRef.current) {
              wonRef.current = true
              onWin()
              return
            }
          } else {
            scoreRef.current = Math.max(0, scoreRef.current - 1)
            setScore(scoreRef.current)
            setFlash('bad')
            setTicker(`-${(Math.random() * 3 + 0.5).toFixed(2)} ♥`)
            window.setTimeout(() => setFlash(null), 180)
          }
          continue
        }

        if (e.y < h + 40) next.push(e)
      }
      entities.current = next

      // paint entities via DOM sync — lightweight canvas overlay
      const layer = el.querySelector('.orbit__entities') as HTMLCanvasElement | null
      if (layer) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        if (layer.width !== Math.floor(w * dpr) || layer.height !== Math.floor(h * dpr)) {
          layer.width = Math.floor(w * dpr)
          layer.height = Math.floor(h * dpr)
          layer.style.width = `${w}px`
          layer.style.height = `${h}px`
        }
        const ctx = layer.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, w, h)
          for (const e of entities.current) {
            const glow = 0.65 + 0.35 * Math.sin(e.pulse)
            ctx.beginPath()
            if (e.kind === 'signal') {
              ctx.fillStyle = `rgba(240, 199, 94, ${0.55 + glow * 0.35})`
              ctx.shadowColor = '#f0c75e'
              ctx.shadowBlur = 18
              ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
              ctx.fill()
              ctx.shadowBlur = 0
              ctx.fillStyle = '#fff6d6'
              ctx.beginPath()
              ctx.arc(e.x, e.y, e.r * 0.35, 0, Math.PI * 2)
              ctx.fill()
            } else {
              drawFallingStar(ctx, e.x, e.y, e.r, e.pulse * 0.55, glow)
            }
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [onWin, ready])

  useEffect(() => {
    if (!ready || wonRef.current) return
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id)
          if (scoreRef.current >= Math.ceil(GAME.targetScore * 0.5) && !wonRef.current) {
            wonRef.current = true
            onWin()
          } else {
            setFailed(true)
            failedRef.current = true
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [onWin, ready, runId])

  const retry = () => {
    entities.current = []
    scoreRef.current = 0
    wonRef.current = false
    failedRef.current = false
    setScore(0)
    setTimeLeft(GAME.durationSec)
    setFailed(false)
    setTicker('+0.00 ♥')
    setReady(false)
    setCountdown(4)
    setRunId((n) => n + 1)
  }

  const progress = Math.min(100, (score / GAME.targetScore) * 100)

  return (
    <div className={`orbit stage ${flash ? `orbit--${flash}` : ''}`}>
      <Starfield density={1.1} />

      <header className="orbit__hud">
        <div>
          <p className="hud-label">{GAME.title}</p>
          <h2 className="orbit__name">{GAME.subtitle}</h2>
        </div>
        <div className="orbit__metrics">
          <div className="orbit__metric">
            <span>signal</span>
            <strong>
              {score}/{GAME.targetScore}
            </strong>
          </div>
          <div className="orbit__metric">
            <span>eta</span>
            <strong>{timeLeft}s</strong>
          </div>
          <div className="orbit__metric orbit__metric--live">
            <span>feed</span>
            <strong>{ticker}</strong>
          </div>
        </div>
      </header>

      <div className="orbit__bar" aria-hidden>
        <div className="orbit__bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="orbit__play" ref={playRef}>
        <canvas className="orbit__entities" aria-hidden />
        <div className="orbit__ship" style={{ left: `${shipPct}%` }} aria-hidden>
          <svg className="orbit__heart" viewBox="0 0 80 72">
            <path d="M40 64 20 45 9 31 12 18 22 10 32 12 40 23 48 12 58 10 68 18 71 31 60 45Z" />
            <path className="orbit__heart-link" d="m12 18 28 5 28-5M20 45l20-22 20 22M9 31l31 33 31-33" />
            <g>
              <circle cx="40" cy="64" r="3.2" />
              <circle cx="20" cy="45" r="2.5" />
              <circle cx="9" cy="31" r="2.2" />
              <circle cx="12" cy="18" r="3" />
              <circle cx="22" cy="10" r="2.2" />
              <circle cx="32" cy="12" r="2.5" />
              <circle cx="40" cy="23" r="3.5" />
              <circle cx="48" cy="12" r="2.5" />
              <circle cx="58" cy="10" r="2.2" />
              <circle cx="68" cy="18" r="3" />
              <circle cx="71" cy="31" r="2.2" />
              <circle cx="60" cy="45" r="2.5" />
            </g>
          </svg>
        </div>
        <p className="orbit__hint">води пальцем / мышкой · лови золотые сигналы · избегай алых звёзд</p>

        {!ready && (
          <div className="orbit__ready">
            <p className="hud-label">briefing</p>
            <strong>{countdown}</strong>
            <p>
              лови золотые сигналы
              <br />
              избегай алых падающих звёзд
            </p>
            <span>созвездие движется за тобой</span>
          </div>
        )}

        {failed && (
          <div className="orbit__fail">
            <p>сигнал прервался</p>
            <button type="button" onClick={retry}>
              попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
