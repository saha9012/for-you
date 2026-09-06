import { motion } from 'framer-motion'
import { Fireworks } from './Fireworks'
import { Starfield } from './Starfield'
import './SaluteIntro.css'

type Props = {
  onContinue: () => void
}

export function SaluteIntro({ onContinue }: Props) {
  return (
    <div className="salute stage">
      <Starfield density={1.15} />
      <div className="salute__aurora salute__aurora--one" aria-hidden />
      <div className="salute__aurora salute__aurora--two" aria-hidden />
      <div className="salute__orbit" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="salute__grain" aria-hidden />
      <Fireworks intensity={1.25} openingCount={3} continuous />

      <div className="salute__content">
        <motion.p
          className="hud-label salute__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          made with love · one of one
        </motion.p>

        <motion.h1
          className="display-title salute__title"
          initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          для любимой
        </motion.h1>

        <motion.p
          className="soft-copy salute__copy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          сегодня всё сияет для тебя. дальше — только ты.
        </motion.p>

        <motion.button
          type="button"
          className="salute__cta"
          onClick={onContinue}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.55 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>начать</span>
          <span className="salute__cta-arrow" aria-hidden>↗</span>
        </motion.button>
      </div>

    </div>
  )
}
