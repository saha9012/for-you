/** Поменяй имя и текст — это всё, что нужно под неё */
export const HER_NAME = 'любимая'

export const SITE_TITLE = `для ${HER_NAME}`

export const BOOT_MS = 3000

export const LOVE_QUESTION = 'ты меня любишь?'

export const GAME = {
  targetScore: 18,
  durationSec: 68,
  title: 'ORBIT PROTOCOL',
  subtitle: 'собери сигналы любви в космосе',
} as const

export const FINALE = {
  headline: `с днём рождения, ${HER_NAME}`,
  lines: [
    'ты — мой самый яркий сигнал в этой темноте.',
    'я сделал этот мир специально для тебя.',
    'пусть сегодня звёзды горят только для нас.',
  ],
} as const
