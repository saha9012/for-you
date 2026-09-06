import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BootScreen } from './components/BootScreen'
import { SaluteIntro } from './components/SaluteIntro'
import { LoveQuestion } from './components/LoveQuestion'
import { OrbitGame } from './components/OrbitGame'
import { Finale } from './components/Finale'
import { SITE_TITLE } from './config'

type Stage = 'boot' | 'salute' | 'question' | 'game' | 'finale'

export default function App() {
  const [stage, setStage] = useState<Stage>('boot')

  const toSalute = useCallback(() => setStage('salute'), [])
  const toQuestion = useCallback(() => setStage('question'), [])
  const toGame = useCallback(() => setStage('game'), [])
  const toFinale = useCallback(() => setStage('finale'), [])

  return (
    <div className="app-shell" data-stage={stage}>
      <h1 className="sr-only">{SITE_TITLE}</h1>
      <AnimatePresence mode="wait">
        {stage === 'boot' && (
          <motion.div
            key="boot"
            style={{ position: 'absolute', inset: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BootScreen onDone={toSalute} />
          </motion.div>
        )}

        {stage === 'salute' && (
          <motion.div
            key="salute"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <SaluteIntro onContinue={toQuestion} />
          </motion.div>
        )}

        {stage === 'question' && (
          <motion.div
            key="question"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <LoveQuestion onYes={toGame} />
          </motion.div>
        )}

        {stage === 'game' && (
          <motion.div
            key="game"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <OrbitGame onWin={toFinale} />
          </motion.div>
        )}

        {stage === 'finale' && (
          <motion.div
            key="finale"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <Finale />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
