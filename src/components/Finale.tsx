import { useState } from 'react'
import { motion } from 'framer-motion'
import { FINALE } from '../config'
import { Fireworks } from './Fireworks'
import { Starfield } from './Starfield'
import './Finale.css'

export function Finale() {
  const [hintOpened, setHintOpened] = useState(false)

  return (
    <div className="finale stage">
      <Starfield density={1.15} />
      <div className="finale__nebula finale__nebula--violet" aria-hidden />
      <div className="finale__nebula finale__nebula--gold" aria-hidden />
      <div className="saturn" aria-hidden>
        <div className="saturn__rings saturn__rings--back">
          <i />
          <i />
          <i />
        </div>
        <div className="saturn__body">
          <span />
        </div>
        <div className="saturn__rings saturn__rings--front">
          <i />
          <i />
          <i />
        </div>
        <div className="saturn__moon" />
      </div>
      <Fireworks
        intensity={1.1}
        openingCount={2}
        showRocketTrails={false}
        persistentTrails={false}
        continuous
      />

      <div className="finale__content">
        <motion.h1
          className="display-title finale__title"
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.45, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          {FINALE.headline}
        </motion.h1>

        <div className="finale__lines">
          {FINALE.lines.map((line, i) => (
            <motion.p
              key={line}
              className="finale__line"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.35, duration: 0.55 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.button
          type="button"
          className="finale__seal"
          onClick={() => setHintOpened(true)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.3, duration: 0.6 }}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.98 }}
        >
          {hintOpened ? '♥ договорились, выберем вместе ♥' : '♥ поможешь мне выбрать футболку? ♥'}
        </motion.button>
      </div>
    </div>
  )
}
