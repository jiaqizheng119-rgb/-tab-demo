export const GUILD_ASSETS = {
  avatar: '/guild/guild-avatar.png',
  achievementBadgeBase: '/guild/achievement-badge-base.png',
  achievementBadgeOverlay: '/guild/achievement-badge-overlay.png',
  presidentCard: {
    base: '/guild/president-card/base.png',
    tag: '/guild/president-card/tag.png',
    emblem: '/guild/president-card/emblem.png',
    badges: '/guild/president-card/badges.png',
    nameBrace: '/guild/president-card/name-brace.svg',
    presidentText: '/guild/president-card/president-text.svg',
  },
  checkinBtnBg: '/guild/checkin-btn-bg.png',
  checkin: {
    expCoin: '/guild/checkin/exp-coin.png',
    mascot: '/guild/checkin/mascot.png',
  },
  podium: '/guild/podium.png',
  sparkle: '/guild/sparkle-stars.png',
  taskShellTab: '/guild/task-card-tab.png',
  publishSheet: {
    pixelCake: '/guild/publish-sheet/icon-tile-cake.png',
    pixelHeart: '/guild/publish-sheet/icon-pixel-heart.png',
    painLou: '/guild/publish-sheet/icon-profile.png',
    productPk: '/guild/publish-sheet/icon-pk.png',
    support: '/guild/publish-sheet/icon-support.png',
    gameBg: '/guild/publish-sheet/icon-game-bg.svg',
    gameFg: '/guild/publish-sheet/icon-game-fg.svg',
  },
  icons: {
    back: '/guild/icons/nav-back.svg',
    share: '/guild/icons/nav-share.svg',
    statusCellular: '/guild/icons/status-cellular.svg',
    statusWifi: '/guild/icons/status-wifi.svg',
    statusBattery: '/guild/icons/status-battery.svg',
    arrow: '/guild/icons/arrow-chevron.svg',
    arrowMore: '/guild/icons/arrow-more.svg',
    megaphone: '/guild/icons/megaphone.svg',
    sparkle: '/guild/icons/sparkle.svg',
    gamepad: '/guild/icons/gamepad.svg',
    chart: '/guild/icons/chart.svg',
  },
} as const

export const MEMBER_AVATARS = [
  '/guild/member-1.png',
  '/guild/member-2.png',
  '/guild/member-3.png',
] as const

export const PRESIDENT_TASKS = [
  { id: 'p1', title: '发布一场公会活动', progress: '0/1', cta: '去发布' },
  { id: 'p2', title: '公会粉丝达到1000人', progress: '0/1000', cta: '去分享' },
  { id: 'p3', title: '创建1个群聊', progress: '0/1', cta: '去创建' },
] as const

export const MINI_GAMES = [
  {
    id: 'g1',
    name: '梓木逢春',
    hint: '合成1000分 经验值+2',
    cover: '/guild/game-zimu.png',
    bg: '#deccff',
    btnText: '#eee5ff',
    topAvatar: '/guild/game-top1-1.png',
  },
  {
    id: 'g2',
    name: '加长林肯',
    hint: '合成1000分 经验值+2',
    cover: '/guild/game-lincoln.png',
    bg: '#ccffe4',
    btnText: '#e5fff1',
    topAvatar: '/guild/game-top1-1.png',
  },
  {
    id: 'g3',
    name: '小鱼盖大楼',
    hint: '合成1000分 经验值+2',
    cover: '/guild/game-fish.png',
    bg: '#ffcce6',
    btnText: '#f8f5ff',
    topAvatar: '/guild/game-top1-1.png',
  },
  {
    id: 'g4',
    name: '星轨拼图',
    hint: '合成1000分 经验值+2',
    cover: '/guild/game-zimu.png',
    bg: '#e4d6ff',
    btnText: '#f8f5ff',
    topAvatar: '/guild/game-top1-1.png',
  },
] as const

export const GAME_PLAYERS = [
  '/guild/game-player-1.png',
  '/guild/game-player-2.png',
  '/guild/game-player-3.png',
  '/guild/game-player-4.png',
] as const

export type InfluenceRank = {
  id: string
  name: string
  score: string
  avatar: string
  rank: 1 | 2 | 3
}

export const INFLUENCE_TOP3: InfluenceRank[] = [
  {
    id: 'r2',
    name: '画框外的猫',
    score: '987424',
    avatar: '/guild/influence-2.png',
    rank: 2,
  },
  {
    id: 'r1',
    name: '雾岛听松',
    score: '3456278',
    avatar: '/guild/influence-1.png',
    rank: 1,
  },
  {
    id: 'r3',
    name: '薄荷撞可乐...',
    score: '94847',
    avatar: '/guild/influence-3.png',
    rank: 3,
  },
]

export const CHAT_GROUPS = [
  {
    id: 'c1',
    name: '渝你同行・梓梦成团哈哈哈哈很好',
    members: '20.3万人',
    desc: '梓渝核心应援总群！聚焦新歌打榜、舞台数据、官方资讯同步，20 万渝丝并肩作战，一起为梓渝的音乐梦想续航，打造最强应援声量💥',
    avatar: '/guild/member-1.png',
  },
  {
    id: 'c2',
    name: '梓渝应援速递站',
    members: '2人',
    desc: '',
    avatar: '/guild/member-2.png',
  },
  {
    id: 'c3',
    name: '梓渝的治愈小窝',
    members: '3人',
    desc: '组织线下灯牌、合唱、拼车的群 组织线下灯牌合唱、拼车的群',
    avatar: '/guild/member-3.png',
  },
  {
    id: 'c4',
    name: '梓渝星途领航队哈哈哈哈哈哈哈哈哈哈',
    members: '1人',
    desc: '梓渝趣味应援补给站！剪辑求助、梗图创作、脑洞闲聊，1 人也能开的快乐小窝，主打一个「梓渝相关的有趣灵魂聚集地」，渝丝的快乐星球🌍',
    avatar: '/guild/game-player-1.png',
  },
] as const

export const GUILD_ANNOUNCEMENT =
  '公会成员必看，所有人在本月30日打卡杭州国大生日应援'

export const CHECKIN_REWARDS = [
  { day: 1, reward: '+2', label: '1天' },
  { day: 2, reward: '+3', label: '2天' },
  { day: 3, reward: '+4', label: '3天' },
  { day: 4, reward: '+5', label: '4天' },
  { day: 5, reward: '+6', label: '5天' },
  { day: 6, reward: '+7', label: '6天' },
  { day: 7, reward: '+8', label: '7天' },
] as const
