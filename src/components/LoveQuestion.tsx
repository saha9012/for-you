import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LOVE_QUESTION } from '../config'
import { Starfield } from './Starfield'
import './LoveQuestion.css'

type Props = {
  onYes: () => void
}

type Pos = { x: number; y: number }

export function LoveQuestion({ onYes }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [dodges, setDodges] = useState(0)

  const teleport = useCallback(() => {
    const area = areaRef.current
    const btn = noRef.current
    if (!area || !btn) return

    const areaRect = area.getBoundingClientRect()
    const bw = btn.offsetWidth || 96
    const bh = btn.offsetHeight || 48
    const pad = 8
    const maxX = Math.max(pad, areaRect.width - bw - pad)
    const maxY = Math.max(pad, areaRect.height - bh - pad)

    let next: Pos = { x: pad, y: pad }
    for (let i = 0; i < 8; i++) {
      next = {
        x: pad + Math.random() * maxX,
        y: pad + Math.random() * maxY,
      }
      const missesYes = !(
        next.x > areaRect.width / 2 - 160 &&
        next.x < areaRect.width / 2 + 45 &&
        next.y > 70 &&
        next.y < 175
      )
      if (missesYes && (!pos || Math.hypot(next.x - pos.x, next.y - pos.y) > 110)) break
    }

    setPos(next)
    setDodges((d) => d + 1)
  }, [pos])

  return (
    <div className="love stage">
      <Starfield density={1} />
      <div className="love__halo" aria-hidden />

      <div className="love__panel">
        <h2 className="display-title love__title">{LOVE_QUESTION}</h2>
        <p className="soft-copy">подумай внимательно. хотя правильный ответ тут всего один.</p>

        <div className="love__arena" ref={areaRef}>
          <motion.button
            type="button"
            className="love__yes"
            onClick={onYes}
          >
            да <span aria-hidden>♥</span>
          </motion.button>

          <motion.button
            ref={noRef}
            type="button"
            className="love__no"
            style={
              pos
                ? {
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                  }
                : undefined
            }
            onMouseEnter={teleport}
            onTouchStart={(e) => {
              e.preventDefault()
              teleport()
            }}
            onClick={(e) => {
              e.preventDefault()
              teleport()
            }}
            animate={{ scale: dodges > 0 ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 0.25 }}
          >
            нет
          </motion.button>
        </div>

        {dodges > 2 && (
          <motion.p
            className="love__hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            кнопка «нет» сбежала. остаётся только правда.
          </motion.p>
        )}
      </div>
    </div>
  )
}
