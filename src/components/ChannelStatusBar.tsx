type ChannelStatusBarProps = {
  variant?: 'light' | 'dark'
}

export function ChannelStatusBar({ variant = 'light' }: ChannelStatusBarProps) {
  const asset = variant === 'dark' ? 'dark' : 'light'

  return (
    <header
      className={'cfp__status' + (variant === 'dark' ? ' cfp__status--dark' : '')}
      aria-hidden="true"
    >
      <span className="cfp__time">9:41</span>
      <div className="cfp__status-icons">
        <img
          className="cfp__status-cellular"
          src={`/channel/full/status/status-cellular-${asset}.svg`}
          alt=""
        />
        <img
          className="cfp__status-wifi"
          src={`/channel/full/status/status-wifi-${asset}.svg`}
          alt=""
        />
        <div className="cfp__status-battery">
          <div className="cfp__status-battery-body">
            <div className="cfp__status-battery-fill" />
          </div>
          <img
            className="cfp__status-battery-cap"
            src={`/channel/full/status/status-cap-${asset}.svg`}
            alt=""
          />
        </div>
      </div>
    </header>
  )
}
