export type ShowcaseIconName
  = | 'activity'
    | 'bar-chart-2'
    | 'bitcoin'
    | 'bot'
    | 'clapperboard'
    | 'globe-2'
    | 'landmark'
    | 'monitor-smartphone'
    | 'server'
    | 'share-2'
    | 'shield-check'
    | 'sliders'
    | 'sun'
    | 'moon'
    | 'trophy'
    | 'trending-up'
    | 'users'
    | 'zap'
    | 'flame'

export const HERO_MARKET_SCENES = [
  {
    sceneClassName: 'hero-market-scene hero-market-scene-a',
    cards: [
      { cardClassName: 'hero-market-card hero-market-card-a1', rotate: '-9deg', imageSrc: '/assets/images/bitcoin-150k.png' },
      {
        cardClassName: 'hero-market-card hero-market-card-a2 is-featured',
        rotate: '-4deg',
        imageSrc: '/assets/images/fed-rate-move.png',
        expandSide: 'right',
      },
      { cardClassName: 'hero-market-card hero-market-card-a3', rotate: '8deg', imageSrc: '/assets/images/uniswap-v4-mainnet.png' },
      { cardClassName: 'hero-market-card hero-market-card-a4', rotate: '4deg', imageSrc: '/assets/images/ethereum-flippening.png' },
    ],
  },
  {
    sceneClassName: 'hero-market-scene hero-market-scene-b',
    cards: [
      { cardClassName: 'hero-market-card hero-market-card-b1', rotate: '-7deg', imageSrc: '/assets/images/elon-500b-net-worth.png' },
      {
        cardClassName: 'hero-market-card hero-market-card-b2 is-featured',
        rotate: '-2deg',
        imageSrc: '/assets/images/donald-trump-president.png',
        expandSide: 'left',
      },
      { cardClassName: 'hero-market-card hero-market-card-b3', rotate: '7deg', imageSrc: '/assets/images/discord-50k-members.png' },
      { cardClassName: 'hero-market-card hero-market-card-b4', rotate: '3deg', imageSrc: '/assets/images/brazil-election-2026.png' },
    ],
  },
  {
    sceneClassName: 'hero-market-scene hero-market-scene-c',
    cards: [
      { cardClassName: 'hero-market-card hero-market-card-c1', rotate: '-8deg', imageSrc: '/assets/images/donald-trump-president.png' },
      {
        cardClassName: 'hero-market-card hero-market-card-c2 is-featured',
        rotate: '-3deg',
        imageSrc: '/assets/images/russia-x-ukraine.png',
        expandSide: 'right',
      },
      { cardClassName: 'hero-market-card hero-market-card-c3', rotate: '8deg', imageSrc: '/assets/images/uk-general-election.png' },
      { cardClassName: 'hero-market-card hero-market-card-c4', rotate: '4deg', imageSrc: '/assets/images/marvel-opening-weekend.png' },
    ],
  },
] as const

export type ShowcaseCard
  = | {
    type: 'single'
    img: string
    title: string
    vol: string
    cat: string
    pct: number
  }
  | {
    type: 'multi'
    img: string
    title: string
    vol: string
    cat: string
    rows: Array<{ label: string, pct: number }>
  }

export interface ShowcaseNiche {
  tag: string
  accent: string
  accentRgb: string
  tagline: string
  icon: ShowcaseIconName
  cards: ShowcaseCard[]
}

export interface ProofCard {
  label: string
  value: string
  copyHtml: string
}
