import { motion } from 'framer-motion'
import { BOOT_MS } from '../config'
import { useEffect, useState } from 'react'
import './BootScreen.css'

type Props = {
  onDone: () => void
}

export function BootScreen({ onDone }: Props) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / BOOT_MS)
      setPct(Math.floor(t * 100))
      if (t < 1) raf = requestAnimationFrame(loop)
      else onDone()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className="boot stage" aria-busy="true" aria-label="Загрузка">
      <motion.div
        className="boot__pulse"
        initial={{ opacity: 0.2, scale: 0.92 }}
        animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="boot__meta">
        <span className="hud-label">system boot</span>
        <span className="boot__pct">{pct.toString().padStart(3, '0')}%</span>
      </div>
    </div>
  )
}
