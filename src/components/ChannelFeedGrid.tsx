import type { FeedCard } from '../data/channelFeed'
import { FEED_AVATAR } from '../data/channelFeed'

type ChannelFeedGridProps = {
  cards: FeedCard[]
}

function EyeIcon() {
  return (
    <svg className="cfg-card__eye" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 3.5C4.5 3.5 2 8 2 8s2.5 4.5 6 4.5 6-4.5 6-4.5-2.5-4.5-6-4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
    </svg>
  )
}

export function ChannelFeedGrid({ cards }: ChannelFeedGridProps) {
  return (
    <div className="cfg">
      {cards.map((card) => (
        <article
          key={card.id}
          className={'cfg-card cfg-card--' + card.size}
        >
          <div className="cfg-card__media">
            <img className="cfg-card__img" src={card.image} alt="" loading="lazy" />
          </div>
          {card.followed ? (
            <span className="cfg-card__tag">你的关注</span>
          ) : null}
          <h3 className="cfg-card__title">{card.title}</h3>
          <footer className="cfg-card__footer">
            <img className="cfg-card__avatar" src={FEED_AVATAR} alt="" />
            <span className="cfg-card__author">{card.author}</span>
            <span className="cfg-card__views">
              <EyeIcon />
              {card.views}
            </span>
          </footer>
        </article>
      ))}
    </div>
  )
}
