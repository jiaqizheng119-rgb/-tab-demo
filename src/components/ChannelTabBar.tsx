import { useEffect, useRef, useState } from 'react'
import type { TopNavLayout } from './ChannelTopNav'
import {
  BUBBLE_THEMES,
  CHANNEL_THEME_ASSETS,
  getChannelTabsForLayout,
  getIconTabsForLayout,
  isIconTheme,
  isScheme5EntryTab,
  type ChannelAssets,
  type ChannelIconTab,
  type ChannelTabSelection,
  type ChannelTheme,
} from '../data/channelTabs'
import '../channel-tab-bar.css'

type ChannelTabBarProps = {
  theme?: ChannelTheme
  topNavLayout?: TopNavLayout
  activeId?: string
  defaultActiveId?: string
  onTabChange?: (tab: ChannelTabSelection) => void
  scrollToCenter?: boolean
  className?: string
}

function TabBubble({
  visible,
  assets,
}: {
  visible: boolean
  assets: ChannelAssets
}) {
  return (
    <span className={'channel-tab-bar__bubble' + (visible ? ' is-visible' : '')} aria-hidden>
      <img className="channel-tab-bar__bubble-bg" src={assets.tabActiveBg} alt="" />
      <span className="channel-tab-bar__bubble-stars">
        <img
          className="channel-tab-bar__star channel-tab-bar__star--left"
          src={assets.starLeft}
          alt=""
        />
        <img
          className="channel-tab-bar__star channel-tab-bar__star--right"
          src={assets.starRight}
          alt=""
        />
      </span>
    </span>
  )
}

function entryTabClass(tabId: string, topNavLayout: TopNavLayout) {
  return isScheme5EntryTab(tabId, topNavLayout)
    ? 'channel-tab-bar__tab--scheme5-entry'
    : ''
}

function IconTabButton({
  tab,
  selected,
  tabRef,
  onSelect,
  topNavLayout,
}: {
  tab: ChannelIconTab
  selected: boolean
  tabRef: (node: HTMLButtonElement | null) => void
  onSelect: () => void
  topNavLayout: TopNavLayout
}) {
  return (
    <button
      ref={tabRef}
      type="button"
      role="tab"
      aria-selected={selected}
      className={[
        'channel-tab-bar__tab',
        'channel-tab-bar__tab--icon',
        selected ? 'is-selected' : '',
        entryTabClass(tab.id, topNavLayout),
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
    >
      <span className="channel-tab-bar__icon-outer">
        <span className="channel-tab-bar__icon-inner">
          <span className="channel-tab-bar__icon-cover-wrap">
            <img className="channel-tab-bar__icon-cover" src={tab.icon} alt="" />
          </span>
          <span className="channel-tab-bar__label">{tab.label}</span>
        </span>
      </span>
    </button>
  )
}

export function ChannelTabBar({
  theme = 'dark',
  topNavLayout = 'scheme1',
  activeId: controlledActiveId,
  defaultActiveId = 'all',
  onTabChange,
  scrollToCenter = false,
  className = '',
}: ChannelTabBarProps) {
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId)
  const activeId = controlledActiveId ?? internalActiveId
  const assets = CHANNEL_THEME_ASSETS[theme]
  const showBubble = BUBBLE_THEMES.includes(theme)
  const iconMode = isIconTheme(theme)
  const iconTabs = getIconTabsForLayout(theme, topNavLayout)
  const channelTabs = getChannelTabsForLayout(theme, topNavLayout)
  const trackRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  function scrollTabToCenter(tabId: string) {
    if (!scrollToCenter) return
    const track = trackRef.current
    const tab = tabRefs.current.get(tabId)
    if (!track || !tab) return

    const target =
      tab.offsetLeft + tab.offsetWidth / 2 - track.clientWidth / 2
    track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }

  function selectTab(tab: ChannelTabSelection) {
    if (controlledActiveId === undefined) {
      setInternalActiveId(tab.id)
    }
    onTabChange?.(tab)
    scrollTabToCenter(tab.id)
  }

  useEffect(() => {
    scrollTabToCenter(activeId)
  }, [activeId, scrollToCenter])

  return (
    <nav
      className={['channel-tab-bar', 'channel-tab-bar--' + theme, className]
        .filter(Boolean)
        .join(' ')}
      aria-label="频道分类"
    >
      <div className="channel-tab-bar__track" role="tablist" ref={trackRef}>
        {iconMode
          ? iconTabs.map((tab) => {
              const selected = activeId === tab.id
              return (
                <IconTabButton
                  key={tab.id}
                  tab={tab}
                  selected={selected}
                  topNavLayout={topNavLayout}
                  tabRef={(node) => {
                    if (node) tabRefs.current.set(tab.id, node)
                    else tabRefs.current.delete(tab.id)
                  }}
                  onSelect={() => selectTab(tab)}
                />
              )
            })
          : channelTabs.map((tab) => {
              const selected = activeId === tab.id

              return (
                <button
                  key={tab.id}
                  ref={(node) => {
                    if (node) tabRefs.current.set(tab.id, node)
                    else tabRefs.current.delete(tab.id)
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={[
                    'channel-tab-bar__tab',
                    `channel-tab-bar__tab--${tab.variant}`,
                    selected ? 'is-selected' : '',
                    entryTabClass(tab.id, topNavLayout),
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectTab(tab)}
                >
                  {showBubble ? <TabBubble visible={selected} assets={assets} /> : null}
                  <span className="channel-tab-bar__content">
                    {tab.variant === 'logo' ? (
                      <img
                        className="channel-tab-bar__logo-img"
                        src={
                          selected
                            ? theme === 'soft'
                              ? assets.ruaTextSoftActive
                              : assets.ruaTextActive
                            : assets.ruaText
                        }
                        alt={tab.label}
                        width={42}
                        height={9}
                      />
                    ) : (
                      <span className="channel-tab-bar__label">{tab.label}</span>
                    )}
                  </span>
                </button>
              )
            })}
      </div>
    </nav>
  )
}
