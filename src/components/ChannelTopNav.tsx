export type TopNavLayout =
  | 'scheme1'
  | 'scheme2'
  | 'scheme3'
  | 'scheme4'
  | 'scheme5'

export const TOP_NAV_LAYOUTS: {
  id: TopNavLayout
  label: string
  description: string
}[] = [
  {
    id: 'scheme1',
    label: '方案一',
    description: '紫V · 关注 · 发现 · 小游戏 · 活动 · 开售',
  },
  {
    id: 'scheme2',
    label: '方案二',
    description: '关注 · 发现 · 紫V · 小游戏 · 活动 · 开售',
  },
  {
    id: 'scheme3',
    label: '方案三',
    description: '关注 · 推荐 · 玩/活动/开售/紫V 胶囊',
  },
  {
    id: 'scheme4',
    label: '方案四',
    description: '活动与推荐并入一起',
  },
  {
    id: 'scheme5',
    label: '方案五',
    description: '小游戏、活动和开售并入二级tab',
  },
]

const TOP_NAV_LABEL_OVERRIDES: Partial<
  Record<TopNavLayout, Partial<Record<string, string>>>
> = {
  scheme3: { 发现: '推荐', 小游戏: '玩' },
  scheme4: { 发现: '活动' },
}

const TOP_NAV_ORDER: Record<TopNavLayout, readonly string[]> = {
  scheme1: ['紫V', '关注', '发现', '小游戏', '活动', '开售'],
  scheme2: ['关注', '发现', '紫V', '小游戏', '活动', '开售'],
  scheme3: ['关注', '发现', '小游戏', '活动', '开售', '紫V'],
  scheme4: ['紫V', '关注', '发现', '小游戏', '开售'],
  scheme5: ['紫V', '关注', '发现'],
}

/** 方案三 · Figma 210:95463 */
const SCHEME3_LEFT_TABS = ['关注', '发现'] as const
const SCHEME3_PILL_TABS = ['小游戏', '活动', '开售', '紫V'] as const

export type ChannelTopNavTab =
  | '紫V'
  | '关注'
  | '发现'
  | '小游戏'
  | '活动'
  | '开售'

type ChannelTopNavProps = {
  activeTab?: '发现' | '小游戏' | '活动' | '开售'
  layout?: TopNavLayout
  variant?: 'light' | 'dark' | 'on-sale'
  onTabClick?: (tab: ChannelTopNavTab) => void
}

export function ChannelTopNav({
  activeTab = '发现',
  layout = 'scheme1',
  variant = 'light',
  onTabClick,
}: ChannelTopNavProps) {
  const navOrder = TOP_NAV_ORDER[layout]
  const isDark = variant === 'dark'
  const isOnSale = variant === 'on-sale'
  const topClass =
    'cfp__top' +
    (isDark ? ' cfp__top--dark' : '') +
    (isOnSale ? ' cfp__top--on-sale' : '') +
    (layout === 'scheme3' ? ' cfp__top--scheme3' : '') +
    (layout === 'scheme5' ? ' cfp__top--scheme5' : '')

  const underlineSrc = isOnSale
    ? '/channel/on-sale/nav-underline.svg'
    : '/channel/full/nav-underline.svg'
  const sidebarSrc = isOnSale
    ? '/channel/on-sale/nav-sidebar.svg'
    : isDark
      ? '/channel/full/nav-sidebar-dark.svg'
      : '/channel/full/nav-sidebar.svg'
  const searchSrc = isOnSale
    ? '/channel/on-sale/nav-search.svg'
    : isDark
      ? '/channel/full/nav-search-dark.svg'
      : '/channel/full/nav-search.svg'

  function getNavDisplayLabel(tab: string) {
    return TOP_NAV_LABEL_OVERRIDES[layout]?.[tab] ?? tab
  }

  function renderNavItem(label: string, active: boolean) {
    const displayLabel = getNavDisplayLabel(label)
    const clickable =
      onTabClick &&
      (label === '发现' || label === '小游戏' || label === '开售')
    const className = 'cfp__nav-item' + (active ? ' is-active' : '')

    const content = (
      <>
        <span className="cfp__nav-text">{displayLabel}</span>
        <img
          className={
            'cfp__nav-underline' + (active ? ' is-visible' : ' is-hidden')
          }
          src={underlineSrc}
          alt=""
        />
      </>
    )

    if (clickable) {
      return (
        <button
          key={label}
          type="button"
          className={className + ' cfp__nav-item--btn'}
          onClick={() => onTabClick(label as ChannelTopNavTab)}
        >
          {content}
        </button>
      )
    }

    return (
      <span key={label} className={className}>
        {content}
      </span>
    )
  }

  function isScheme3PillClickable(label: string) {
    return label === '小游戏' || label === '活动' || label === '开售'
  }

  function renderScheme3PillItem(label: string) {
    const active =
      label === '紫V'
        ? false
        : label === activeTab
    const displayLabel = getNavDisplayLabel(label)
    const clickable = onTabClick && isScheme3PillClickable(label)
    const className =
      'cfp__nav-pill-item' + (active ? ' is-active' : '')

    const content = (
      <>
        <span className="cfp__nav-pill-text">{displayLabel}</span>
        <img
          className={
            'cfp__nav-underline cfp__nav-underline--pill' +
            (active ? ' is-visible' : ' is-hidden')
          }
          src={underlineSrc}
          alt=""
        />
      </>
    )

    if (clickable) {
      return (
        <button
          key={label}
          type="button"
          className={className + ' cfp__nav-pill-item--btn'}
          onClick={() => onTabClick(label as ChannelTopNavTab)}
        >
          {content}
        </button>
      )
    }

    return (
      <span key={label} className={className}>
        {content}
      </span>
    )
  }

  function renderScheme3Nav() {
    return (
      <>
        {SCHEME3_LEFT_TABS.map((label) =>
          renderNavItem(label, label === activeTab),
        )}
        <div className="cfp__nav-pill" aria-label="频道入口">
          {SCHEME3_PILL_TABS.map((label) => renderScheme3PillItem(label))}
        </div>
      </>
    )
  }

  function renderActivityItem() {
    const active = activeTab === '活动'
    const className =
      'cfp__nav-item cfp__nav-item--activity' + (active ? ' is-active' : '')
    const content = (
      <>
        <span className="cfp__nav-activity-wrap">
          <img
            className="cfp__nav-activity-img"
            src={
              active
                ? '/channel/full/nav-activity-active.svg'
                : isOnSale
                  ? '/channel/on-sale/nav-activity.svg'
                  : isDark
                    ? '/channel/full/nav-activity-dark.svg'
                    : '/channel/full/nav-activity.svg'
            }
            alt="活动"
          />
          <img
            className={
              'cfp__nav-activity-accent' +
              (active
                ? ' cfp__nav-activity-accent--active'
                : ' cfp__nav-activity-accent--idle')
            }
            src={
              active
                ? '/channel/full/nav-activity-accent.svg'
                : isOnSale
                  ? '/channel/on-sale/nav-activity-mark.svg'
                  : isDark
                    ? '/channel/full/nav-activity-mark-dark.svg'
                    : '/channel/full/nav-activity-mark.svg'
            }
            alt=""
          />
        </span>
        <img
          className={
            'cfp__nav-underline cfp__nav-underline--activity' +
            (active ? ' is-visible' : ' is-hidden')
          }
          src={underlineSrc}
          alt=""
        />
      </>
    )

    if (onTabClick) {
      return (
        <button
          key="活动"
          type="button"
          className={className + ' cfp__nav-item--btn'}
          onClick={() => onTabClick('活动')}
        >
          {content}
        </button>
      )
    }

    return (
      <span key="活动" className={className}>
        {content}
      </span>
    )
  }

  return (
    <div className={topClass}>
      <button type="button" className="cfp__menu" aria-label="侧边栏">
        <img className="cfp__menu-img" src={sidebarSrc} alt="" />
      </button>

      <nav
        className={'cfp__nav' + (layout === 'scheme3' ? ' cfp__nav--scheme3' : '')}
        aria-label="顶部导航"
      >
        {layout === 'scheme3'
          ? renderScheme3Nav()
          : navOrder.map((item) =>
              item === '活动'
                ? renderActivityItem()
                : renderNavItem(item, item === activeTab),
            )}
      </nav>

      <button type="button" className="cfp__search" aria-label="搜索">
        <img className="cfp__search-img" src={searchSrc} alt="" />
      </button>
    </div>
  )
}
