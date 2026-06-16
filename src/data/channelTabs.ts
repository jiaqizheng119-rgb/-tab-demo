/** 频道标签栏（Figma VGDTRELsVcNMrLcthX9p4Q） */

import type { TopNavLayout } from '../components/ChannelTopNav'

export type ChannelTheme = 'dark' | 'red' | 'pill' | 'soft' | 'icon-pill'

export const SCHEME5_PAGE_TAB_IDS = ['mini-games', 'activity', 'on-sale'] as const
export type Scheme5PageTabId = (typeof SCHEME5_PAGE_TAB_IDS)[number]

export const SCHEME5_ENTRY_TAB_IDS = [
  'all',
  ...SCHEME5_PAGE_TAB_IDS,
] as const

export function isScheme5PageTabId(id: string): id is Scheme5PageTabId {
  return SCHEME5_PAGE_TAB_IDS.includes(id as Scheme5PageTabId)
}

export function isScheme5EntryTab(
  id: string,
  topNavLayout?: TopNavLayout,
) {
  return (
    topNavLayout === 'scheme5' &&
    SCHEME5_ENTRY_TAB_IDS.includes(id as (typeof SCHEME5_ENTRY_TAB_IDS)[number])
  )
}

export type ChannelAssets = {
  tabActiveBg: string
  starLeft: string
  starRight: string
  ruaText: string
  ruaTextActive: string
  ruaTextSoftActive: string
}

const RUA_DARK = {
  ruaText: '/channel/rua-text.svg',
  ruaTextActive: '/channel/rua-text-white.svg',
  ruaTextSoftActive: '/channel/rua-text-red.svg',
} as const

const EMPTY_ASSETS: ChannelAssets = {
  tabActiveBg: '',
  starLeft: '',
  starRight: '',
  ...RUA_DARK,
}

export const CHANNEL_THEME_ASSETS: Record<ChannelTheme, ChannelAssets> = {
  dark: {
    tabActiveBg: '/channel/tab-active-bg.svg',
    starLeft: '/channel/star-purple.svg',
    starRight: '/channel/star-white.svg',
    ...RUA_DARK,
  },
  red: {
    tabActiveBg: '/channel/red/tab-active-bg.svg',
    starLeft: '/channel/red/star-purple.svg',
    starRight: '/channel/red/star-white.svg',
    ruaText: '/channel/red/rua-text.svg',
    ruaTextActive: '/channel/red/rua-text-white.svg',
    ruaTextSoftActive: RUA_DARK.ruaTextSoftActive,
  },
  pill: EMPTY_ASSETS,
  soft: EMPTY_ASSETS,
  'icon-pill': EMPTY_ASSETS,
}

export const BUBBLE_THEMES: ChannelTheme[] = ['dark', 'red']
export const ICON_THEMES: ChannelTheme[] = ['icon-pill']

export function isIconTheme(theme: ChannelTheme) {
  return ICON_THEMES.includes(theme)
}

/** @deprecated use CHANNEL_THEME_ASSETS */
export const CHANNEL_ASSETS = CHANNEL_THEME_ASSETS.dark

export type ChannelTabVariant = 'card' | 'logo' | 'pill-light' | 'pill-muted'

export type ChannelTab = {
  id: string
  label: string
  variant: ChannelTabVariant
}

export type ChannelIconTab = {
  id: string
  label: string
  icon: string
}

export type ChannelTabSelection = {
  id: string
  label: string
}

/** 顶导方案五 · 置于「全部」后的频道入口 */
export const SCHEME5_CHANNEL_TABS: ChannelTab[] = [
  { id: 'mini-games', label: '小游戏', variant: 'card' },
  { id: 'activity', label: '活动', variant: 'card' },
  { id: 'on-sale', label: '开售', variant: 'card' },
]

export const CHANNEL_TABS: ChannelTab[] = [
  { id: 'all', label: '全部', variant: 'card' },
  { id: 'thai', label: '泰娱', variant: 'card' },
  { id: 'fandom', label: '饭圈', variant: 'card' },
  { id: 'rua', label: 'Rua娃吧', variant: 'logo' },
  { id: 'acgn', label: '二次元', variant: 'card' },
  { id: 'bjd', label: 'bjd', variant: 'pill-light' },
  { id: 'lysk', label: '恋与深空', variant: 'pill-muted' },
]

/** 方案五 · 圆角胶囊 + 圆形封面（199:66792） */
export const SCHEME5_ICON_PILL_TABS: ChannelIconTab[] = [
  { id: 'mini-games', label: '小游戏', icon: '/channel/icon-pill/cover-all.png' },
  { id: 'activity', label: '活动', icon: '/channel/icon-pill/cover-all.png' },
  { id: 'on-sale', label: '开售', icon: '/channel/icon-pill/cover-all.png' },
]

export const CHANNEL_ICON_PILL_TABS: ChannelIconTab[] = [
  { id: 'all', label: '全部', icon: '/channel/icon-pill/cover-all.png' },
  { id: 'hanman', label: '韩漫', icon: '/channel/icon-pill/cover-hanman.png' },
  { id: 'idol', label: '爱豆星球', icon: '/channel/icon-pill/cover-idol.png' },
  { id: 'zhaolusi', label: '赵露思', icon: '/channel/icon-pill/cover-zhaolusi.png' },
  { id: 'rua', label: 'rua娃吧', icon: '/channel/icon-pill/cover-rua.png' },
]

function withScheme5Tabs<T extends ChannelTabSelection>(
  tabs: readonly T[],
  extra: readonly T[],
  topNavLayout?: TopNavLayout,
) {
  if (topNavLayout !== 'scheme5' || tabs.length === 0) {
    return [...tabs]
  }
  return [tabs[0], ...extra, ...tabs.slice(1)]
}

export function getChannelTabsForLayout(
  _theme: ChannelTheme,
  topNavLayout: TopNavLayout = 'scheme1',
): ChannelTab[] {
  return withScheme5Tabs(CHANNEL_TABS, SCHEME5_CHANNEL_TABS, topNavLayout)
}

export function getIconTabsForLayout(
  _theme: ChannelTheme,
  topNavLayout: TopNavLayout = 'scheme1',
): ChannelIconTab[] {
  return withScheme5Tabs(
    CHANNEL_ICON_PILL_TABS,
    SCHEME5_ICON_PILL_TABS,
    topNavLayout,
  )
}

/** @deprecated use getIconTabsForLayout */
export function getIconTabsForTheme(theme: ChannelTheme): ChannelIconTab[] {
  return getIconTabsForLayout(theme)
}

export function getTabsForTheme(
  theme: ChannelTheme,
  topNavLayout: TopNavLayout = 'scheme1',
): ChannelTabSelection[] {
  return isIconTheme(theme)
    ? getIconTabsForLayout(theme, topNavLayout)
    : getChannelTabsForLayout(theme, topNavLayout)
}

export const CHANNEL_THEMES: { id: ChannelTheme; label: string; nodeId: string }[] = [
  { id: 'dark', label: '方案一 · 黑色气泡', nodeId: '199:66856' },
  { id: 'red', label: '方案二 · 红色气泡', nodeId: '199:67647' },
  { id: 'pill', label: '方案三 · 胶囊选中', nodeId: '196:57603' },
  { id: 'soft', label: '方案四 · 浅底红字', nodeId: '196:59474' },
  { id: 'icon-pill', label: '方案五 · 圆角胶囊', nodeId: '199:66792' },
]
