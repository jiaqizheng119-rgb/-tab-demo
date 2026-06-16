import '../channel-bottom-tab.css'

export function ChannelBottomTab() {
  return (
    <nav className="cfp-bottom-tab" aria-label="底部导航">
      <img
        className="cfp-bottom-tab__img"
        src="/channel/full/bottom-tab.png"
        alt=""
        draggable={false}
      />
    </nav>
  )
}
