import { GUILD_ASSETS } from '../data/guildHome'

export function PresidentCard() {
  return (
    <article className="gh-president-card" aria-label="会长名片">
      <img
        className="gh-president-card__base"
        src={GUILD_ASSETS.presidentCard.base}
        alt=""
        aria-hidden="true"
      />

      <img
        className="gh-president-card__tag"
        src={GUILD_ASSETS.presidentCard.tag}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />

      <div className="gh-president-card__info">
        <div className="gh-president-card__name-row">
          <img className="gh-president-card__brace" src={GUILD_ASSETS.presidentCard.nameBrace} alt="" aria-hidden="true" />
          <span className="gh-president-card__name">一只小Yuni😊</span>
          <img
            className="gh-president-card__brace gh-president-card__brace--right"
            src={GUILD_ASSETS.presidentCard.nameBrace}
            alt=""
            aria-hidden="true"
          />
          <img
            className="gh-president-card__role"
            src={GUILD_ASSETS.presidentCard.presidentText}
            alt="会长"
          />
        </div>

        <div className="gh-president-card__badges-row">
          <img
            className="gh-president-card__badges"
            src={GUILD_ASSETS.presidentCard.badges}
            alt=""
            aria-hidden="true"
          />
          <span className="gh-president-card__achieve-text">解锁10个成就</span>
        </div>
      </div>

      <img
        className="gh-president-card__emblem"
        src={GUILD_ASSETS.presidentCard.emblem}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
    </article>
  )
}
