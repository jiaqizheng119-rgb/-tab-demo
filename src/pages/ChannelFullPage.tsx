import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChannelFeedGrid } from '../components/ChannelFeedGrid'
import { ChannelTabBar } from '../components/ChannelTabBar'
import { ChannelStatusBar } from '../components/ChannelStatusBar'
import { ChannelBottomTab } from '../components/ChannelBottomTab'
import {
  ChannelTopNav,
  TOP_NAV_LAYOUTS,
  type TopNavLayout,
} from '../components/ChannelTopNav'
import { getChannelFeed } from '../data/channelFeed'
import {
  SCHEME4_ACTIVITY_HEADER,
  SCHEME4_FEED_TOP,
} from '../data/scheme4ActivityFeed'
import {
  CHANNEL_THEMES,
  getTabsForTheme,
  isScheme5PageTabId,
  type ChannelTabSelection,
  type ChannelTheme,
} from '../data/channelTabs'
import '../channel-full-page.css'
import '../channel-on-sale-page.css'
import '../channel-activity-page.css'
import '../channel-mini-games-page.css'

const ACTIVITY_BACKGROUND =
  'linear-gradient(114.6deg, #e9eaff 16.5%, #ffeaf9 44.3%)'

const MINI_GAMES_BACKGROUND = '#121118'

const ON_SALE_HEADER_BACKGROUND = '#ff4f75'

function channelTabsScrollBackground(
  view: ChannelView,
  discoverBg: string,
) {
  if (view === 'mini-games') return MINI_GAMES_BACKGROUND
  if (view === 'activity') return ACTIVITY_BACKGROUND
  if (view === 'on-sale') return ON_SALE_HEADER_BACKGROUND
  return discoverBg
}

function topNavVariant(
  view: ChannelView,
): 'light' | 'dark' | 'on-sale' {
  if (view === 'mini-games') return 'dark'
  if (view === 'on-sale') return 'on-sale'
  return 'light'
}

function isLightView(view: ChannelView) {
  return view === 'discover' || view === 'activity'
}

type ChannelView = 'discover' | 'mini-games' | 'activity' | 'on-sale'

function viewFromPath(pathname: string): ChannelView {
  if (pathname === '/channel-mini-games') return 'mini-games'
  if (pathname === '/channel-activity') return 'activity'
  if (pathname === '/channel-on-sale') return 'on-sale'
  return 'discover'
}

function activeTopTab(
  view: ChannelView,
): '发现' | '小游戏' | '活动' | '开售' {
  if (view === 'mini-games') return '小游戏'
  if (view === 'activity') return '活动'
  if (view === 'on-sale') return '开售'
  return '发现'
}

export default function ChannelFullPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState<ChannelTheme>('dark')
  const [topNavLayout, setTopNavLayout] = useState<TopNavLayout>('scheme1')
  const [activeChannelId, setActiveChannelId] = useState('all')
  const [view, setView] = useState<ChannelView>(() => viewFromPath(location.pathname))
  const [isMorphing, setIsMorphing] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const prevView = useRef<ChannelView>(view)
  const prevTopNavLayout = useRef<TopNavLayout>(topNavLayout)
  const skipMorphOnMount = useRef(true)
  const feedScrollRef = useRef<HTMLDivElement>(null)
  const feedChannelId = isScheme5PageTabId(activeChannelId) ? 'all' : activeChannelId
  const content = getChannelFeed(theme, feedChannelId)
  const showChannelTabs = view === 'discover' || topNavLayout === 'scheme5'
  const isOverlayNav = view === 'mini-games' || view === 'on-sale'
  const navVariant = topNavVariant(view)
  const showHeaderBg = headerScrolled
  const discoverBg =
    topNavLayout === 'scheme4' ? ACTIVITY_BACKGROUND : content.background
  const channelTabsScrolled = headerScrolled && showChannelTabs
  const discoverHeaderStyle =
    view === 'discover' && headerScrolled
      ? { background: discoverBg }
      : undefined
  const channelTabsStyle = channelTabsScrolled
    ? { background: channelTabsScrollBackground(view, discoverBg) }
    : undefined
  const channelTabOnDark =
    topNavLayout === 'scheme5' &&
    theme === 'soft' &&
    (view === 'on-sale' || view === 'mini-games')

  useEffect(() => {
    setView(viewFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    setHeaderScrolled(false)
  }, [view])

  function handleContentScroll(event: UIEvent<HTMLDivElement>) {
    setHeaderScrolled(event.currentTarget.scrollTop > 4)
  }

  useEffect(() => {
    const wasDark = prevView.current === 'mini-games'
    const isDark = view === 'mini-games'
    const wasOnSale = prevView.current === 'on-sale'
    const isOnSale = view === 'on-sale'
    const wasLight = isLightView(prevView.current)
    const isLight = isLightView(view)
    const needsMorph =
      wasDark !== isDark ||
      (wasOnSale && isLight) ||
      (isOnSale && wasLight)

    if (skipMorphOnMount.current) {
      skipMorphOnMount.current = false
      prevView.current = view
      return
    }

    if (needsMorph) {
      setIsMorphing(true)
      const timer = window.setTimeout(() => setIsMorphing(false), 460)
      prevView.current = view
      return () => window.clearTimeout(timer)
    }

    prevView.current = view
  }, [view])

  useEffect(() => {
    const tabs = getTabsForTheme(theme, topNavLayout)
    if (!tabs.some((tab) => tab.id === activeChannelId)) {
      setActiveChannelId('all')
    }
  }, [theme, activeChannelId, topNavLayout])

  useEffect(() => {
    feedScrollRef.current?.scrollTo({ top: 0 })
  }, [activeChannelId, theme, topNavLayout])

  useEffect(() => {
    if (topNavLayout !== 'scheme5') return

    if (view === 'mini-games') setActiveChannelId('mini-games')
    else if (view === 'activity') setActiveChannelId('activity')
    else if (view === 'on-sale') setActiveChannelId('on-sale')
    else if (isScheme5PageTabId(activeChannelId)) setActiveChannelId('all')
  }, [topNavLayout, view, activeChannelId])

  useEffect(() => {
    const prev = prevTopNavLayout.current
    prevTopNavLayout.current = topNavLayout

    if (prev !== 'scheme5' || topNavLayout === 'scheme5') return

    if (isScheme5PageTabId(activeChannelId)) setActiveChannelId('all')
    if (view !== 'discover') navigate('/channel-full', { replace: true })
  }, [topNavLayout, activeChannelId, view, navigate])

  function handleTabChange(tab: ChannelTabSelection) {
    setActiveChannelId(tab.id)

    if (topNavLayout !== 'scheme5') return

    if (tab.id === 'mini-games') goToMiniGames()
    else if (tab.id === 'activity') goToActivity()
    else if (tab.id === 'on-sale') goToOnSale()
    else goToDiscover()
  }

  function goToMiniGames() {
    if (view !== 'mini-games') {
      navigate('/channel-mini-games')
    }
  }

  function goToActivity() {
    if (view !== 'activity') {
      navigate('/channel-activity')
    }
  }

  function goToOnSale() {
    if (view !== 'on-sale') {
      navigate('/channel-on-sale')
    }
  }

  function goToDiscover() {
    if (view !== 'discover') {
      navigate('/channel-full')
    }
  }

  return (
    <div className="cfp-shell">
      <aside className="cfp-sidebar" aria-label="方案选择">
        <section className="cfp-sidebar__section">
          <h2 className="cfp-sidebar__title">顶部tab排序方案</h2>
          <div
            className="cfp-layout-toolbar"
            role="tablist"
            aria-label="顶部tab排序方案"
          >
            {TOP_NAV_LAYOUTS.map((item) => {
              const active = topNavLayout === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={
                    'cfp-layout-toolbar__btn' + (active ? ' is-active' : '')
                  }
                  onClick={() => setTopNavLayout(item.id)}
                >
                  <span className="cfp-layout-toolbar__label">{item.label}</span>
                  <span className="cfp-layout-toolbar__desc">
                    {item.description}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="cfp-sidebar__section">
          <h2 className="cfp-sidebar__title">二级tab样式方案</h2>
          <div
            className="cfp-toolbar"
            role="tablist"
            aria-label="二级tab样式方案"
          >
            {CHANNEL_THEMES.map((item) => {
              const active = theme === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={'cfp-toolbar__btn' + (active ? ' is-active' : '')}
                  onClick={() => {
                    setTheme(item.id)
                    const tabs = getTabsForTheme(item.id, topNavLayout)
                    if (!tabs.some((tab) => tab.id === activeChannelId)) {
                      setActiveChannelId('all')
                    }
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </section>
      </aside>

      <main className="cfp-stage">
        <div className="cfp-phone" aria-label="频道页预览">
        <div
          className={
            'cfp' + (topNavLayout === 'scheme5' ? ' cfp--top-scheme5' : '')
          }
        >
          <div
            className={
              'cfp-bg-stack' +
              (isMorphing
                ? ' is-morphing cfp-bg-stack--' +
                  (view === 'mini-games'
                    ? 'to-dark'
                    : view === 'on-sale'
                      ? 'to-on-sale'
                      : 'to-light')
                : '')
            }
            data-view={view}
          >
            <div
              className="cfp-bg cfp-bg--discover"
              key={
                topNavLayout === 'scheme4'
                  ? 'scheme4-discover-bg'
                  : theme + '-' + activeChannelId
              }
              style={{ background: discoverBg }}
            />
            <div
              className="cfp-bg cfp-bg--mini-games"
              style={{ background: MINI_GAMES_BACKGROUND }}
            />
            <div
              className="cfp-bg cfp-bg--activity"
              style={{ background: ACTIVITY_BACKGROUND }}
            />
            <div className="cfp-bg cfp-bg--on-sale">
              <img
                className="cfp__on-sale-bg-atmosphere"
                src="/channel/on-sale/bg-atmosphere.svg"
                alt=""
              />
              <div className="cfp__on-sale-bg-gradient" aria-hidden="true" />
            </div>
          </div>

          <div className="cfp-content-viewport" data-view={view}>
            <div
              className="cfp-panel cfp-panel--discover"
              aria-hidden={view !== 'discover'}
            >
              <div className="cfp__panel-body cfp__panel-body--discover">
                <div
                  ref={feedScrollRef}
                  className={
                    'cfp__feed-scroll' +
                    (topNavLayout === 'scheme4'
                      ? ' cfp__feed-scroll--activity-content'
                      : '')
                  }
                  onScroll={handleContentScroll}
                >
                  {topNavLayout === 'scheme4' ? (
                    <div
                      className="cfp__scheme4-activity"
                      style={
                        {
                          '--scheme4-feed-top': SCHEME4_FEED_TOP + 'px',
                        } as CSSProperties
                      }
                    >
                      <div className="cfp__scheme4-activity-header" aria-hidden="true">
                        <img
                          className="cfp__scheme4-activity-header-img"
                          src={SCHEME4_ACTIVITY_HEADER}
                          alt=""
                        />
                      </div>
                      <section
                        className="cfp__feed cfp__scheme4-feed"
                        key={theme + '-scheme4-feed-' + activeChannelId}
                      >
                        <ChannelFeedGrid cards={content.cards} />
                      </section>
                    </div>
                  ) : (
                    <section
                      className="cfp__feed"
                      key={theme + '-feed-' + activeChannelId}
                    >
                      <ChannelFeedGrid cards={content.cards} />
                    </section>
                  )}
                </div>
              </div>
            </div>

            <div
              className="cfp-panel cfp-panel--mini-games"
              aria-hidden={view !== 'mini-games'}
            >
              <div className="cfp__panel-body" onScroll={handleContentScroll}>
                <div className="cfp__mini-games">
                  <img
                    className="cfp__mini-games-img"
                    src="/channel/mini-games/content.png"
                    alt="小游戏频道内容"
                  />
                </div>
              </div>
            </div>

            <div
              className="cfp-panel cfp-panel--activity"
              aria-hidden={view !== 'activity'}
            >
              <div className="cfp__panel-body" onScroll={handleContentScroll}>
                <div className="cfp__activity">
                  <img
                    className="cfp__activity-img"
                    src="/channel/activity/content.png"
                    alt="活动频道内容"
                  />
                </div>
              </div>
            </div>

            <div
              className="cfp-panel cfp-panel--on-sale"
              aria-hidden={view !== 'on-sale'}
            >
              <div className="cfp__panel-body" onScroll={handleContentScroll}>
                <div className="cfp__on-sale">
                  <div className="cfp__on-sale-above">
                    <img
                      className="cfp__on-sale-img cfp__on-sale-img--above"
                      src="/channel/on-sale/content.png"
                      alt=""
                    />
                    <img
                      className="cfp__on-sale-section-underline"
                      src="/channel/on-sale/section-underline.svg"
                      alt=""
                    />
                  </div>
                  <div className="cfp__on-sale-feed">
                    <img
                      className="cfp__on-sale-img cfp__on-sale-img--feed"
                      src="/channel/on-sale/content.png"
                      alt="开售频道内容"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showChannelTabs ? (
            <div
              className={
                'cfp__channels' +
                (channelTabsScrolled ? ' cfp__channels--scrolled' : '')
              }
              style={channelTabsStyle}
            >
              <ChannelTabBar
                key={theme + '-' + topNavLayout + '-' + view}
                theme={theme}
                topNavLayout={topNavLayout}
                activeId={activeChannelId}
                onTabChange={handleTabChange}
                scrollToCenter
                className={
                  channelTabOnDark ? 'channel-tab-bar--on-dark' : ''
                }
              />
            </div>
          ) : null}

          <div
            className={
              'cfp__header' +
              (isOverlayNav ? ' cfp__header--overlay' : '') +
              (showHeaderBg
                ? ' cfp__header--scrolled cfp__header--' + view
                : '')
            }
            style={discoverHeaderStyle}
          >
            <ChannelStatusBar variant={isOverlayNav ? 'dark' : 'light'} />

            <ChannelTopNav
              activeTab={activeTopTab(view)}
              layout={topNavLayout}
              variant={navVariant}
              onTabClick={(tab) => {
                if (tab === '小游戏') goToMiniGames()
                if (tab === '活动') goToActivity()
                if (tab === '开售') goToOnSale()
                if (tab === '发现') goToDiscover()
              }}
            />
          </div>

          <ChannelBottomTab />
        </div>
        </div>
      </main>
    </div>
  )
}
