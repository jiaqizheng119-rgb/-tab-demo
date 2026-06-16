import { Link } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { CheckinModal } from '../components/CheckinModal'
import { PresidentCard } from '../components/PresidentCard'
import { PresidentTaskCard } from '../components/PresidentTaskCard'
import {
  CHAT_GROUPS,
  GAME_PLAYERS,
  GUILD_ANNOUNCEMENT,
  GUILD_ASSETS,
  INFLUENCE_TOP3,
  MEMBER_AVATARS,
  MINI_GAMES,
  type InfluenceRank,
} from '../data/guildHome'
import '../guild-home.css'

function FigmaIcon({
  src,
  className = '',
  alt = '',
}: {
  src: string
  className?: string
  alt?: string
}) {
  return <img className={'gh-icon ' + className} src={src} alt={alt} aria-hidden={!alt} />
}

function IconArrow() {
  return (
    <span className="gh-chevron-wrap" aria-hidden="true">
      <img className="gh-chevron-right" src={GUILD_ASSETS.icons.arrow} alt="" />
    </span>
  )
}

function IconMore() {
  return (
    <svg className="gh-nav__icon" viewBox="0 0 21 21" aria-hidden="true">
      <circle cx="5" cy="10.5" r="1.4" fill="currentColor" />
      <circle cx="10.5" cy="10.5" r="1.4" fill="currentColor" />
      <circle cx="16" cy="10.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

function IconChatHall() {
  return (
    <svg className="gh-section__icon" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4 4.5h10a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2H9l-3.5 3v-3H4a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="9" r="0.8" fill="currentColor" />
      <circle cx="9.5" cy="9" r="0.8" fill="currentColor" />
      <circle cx="12" cy="9" r="0.8" fill="currentColor" />
    </svg>
  )
}

function IconLive() {
  return (
    <svg className="gh-chat__live" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="1" y="5" width="2" height="5" rx="0.5" fill="currentColor" />
      <rect x="5" y="3" width="2" height="7" rx="0.5" fill="currentColor" />
      <rect x="9" y="1" width="2" height="9" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function IconAddPeople() {
  return (
    <svg className="gh-footer__glyph" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17.5c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 11v5M14.5 13.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconStartActivity() {
  return (
    <img
      className="gh-footer__sparkle-icon"
      src={GUILD_ASSETS.icons.sparkle}
      alt=""
      aria-hidden="true"
    />
  )
}

function SectionHead({
  icon,
  title,
  titleId,
}: {
  icon: ReactNode
  title: string
  titleId: string
}) {
  return (
    <div className="gh-section__head">
      {icon}
      <h2 id={titleId} className="gh-section__title">
        {title}
      </h2>
    </div>
  )
}

function GameCard({ game }: { game: (typeof MINI_GAMES)[number] }) {
  return (
    <article className="gh-game-card" style={{ backgroundColor: game.bg }}>
      <img className="gh-game-card__cover" src={game.cover} alt="" loading="lazy" />
      <div className="gh-game-card__body">
        <h3 className="gh-game-card__title">{game.name}</h3>
        <p className="gh-game-card__hint">{game.hint}</p>
      </div>
      <div className="gh-game-card__foot">
        <div className="gh-game-card__social">
          <div className="gh-game-card__top">
            <div className="gh-game-card__top-avatar">
              <img src={game.topAvatar} alt="" loading="lazy" />
            </div>
            <span className="gh-game-card__top-badge">TOP1</span>
          </div>
          <div className="gh-game-card__players" aria-hidden="true">
            {GAME_PLAYERS.map((src, i) => (
              <img key={`${game.id}-p-${i}`} src={src} alt="" loading="lazy" />
            ))}
          </div>
        </div>
        <button type="button" className="gh-game-card__btn" style={{ color: game.btnText }}>
          挑战
        </button>
      </div>
    </article>
  )
}

function InfluenceSlot({ leader }: { leader: InfluenceRank }) {
  const rankClass =
    leader.rank === 1
      ? 'gh-influence__slot--first'
      : leader.rank === 2
        ? 'gh-influence__slot--second'
        : 'gh-influence__slot--third'

  return (
    <div className={'gh-influence__slot ' + rankClass}>
      <div className="gh-influence__avatar-wrap">
        <img className="gh-influence__avatar" src={leader.avatar} alt="" loading="lazy" />
        <span className="gh-influence__rank-badge">{leader.rank}</span>
      </div>
      <p className="gh-influence__score">{leader.score}</p>
      <p className="gh-influence__name">{leader.name}</p>
      <span className="gh-influence__level">Lv1</span>
    </div>
  )
}

function ChatRow({ group }: { group: (typeof CHAT_GROUPS)[number] }) {
  return (
    <article className="gh-chat-row">
      <img className="gh-chat-row__avatar" src={group.avatar} alt="" loading="lazy" />
      <div className="gh-chat-row__main">
        <div className="gh-chat-row__head">
          <h3 className="gh-chat-row__name">{group.name}</h3>
          <span className="gh-chat-row__meta">
            {group.members}
            <IconLive />
          </span>
        </div>
        {group.desc ? <p className="gh-chat-row__desc">{group.desc}</p> : null}
      </div>
      <button type="button" className="gh-chat-row__more" aria-label="更多操作">
        <IconMore />
      </button>
    </article>
  )
}

function isCheckinCaptureOpen() {
  if (typeof window === 'undefined') return false
  const mode = new URLSearchParams(window.location.search).get('checkin')
  return mode === '1' || mode === 'prompt' || mode === 'success'
}

export default function GuildHome() {
  const [checkinOpen, setCheckinOpen] = useState(isCheckinCaptureOpen)

  return (
    <div className="guild-home">
      <header className="gh-header">
        <div className="gh-header__hero" aria-hidden="true" />

        <div className="gh-header__chrome">
          <div className="gh-status" aria-hidden="true">
            <span className="gh-status__time">9:41</span>
            <div className="gh-status__levels">
              <img
                className="gh-status__icon gh-status__icon--cellular"
                src={GUILD_ASSETS.icons.statusCellular}
                alt=""
              />
              <img
                className="gh-status__icon gh-status__icon--wifi"
                src={GUILD_ASSETS.icons.statusWifi}
                alt=""
              />
              <img
                className="gh-status__icon gh-status__icon--battery"
                src={GUILD_ASSETS.icons.statusBattery}
                alt=""
              />
            </div>
          </div>

          <div className="gh-header__nav">
            <button type="button" className="gh-header__nav-btn" aria-label="返回">
              <FigmaIcon className="gh-nav__icon-img gh-nav__icon-img--back" src={GUILD_ASSETS.icons.back} />
            </button>
            <div className="gh-header__nav-right">
              <button type="button" className="gh-header__more-link">
                更多公会
              </button>
              <button type="button" className="gh-header__nav-btn" aria-label="分享">
                <FigmaIcon className="gh-nav__icon-img gh-nav__icon-img--share" src={GUILD_ASSETS.icons.share} />
              </button>
            </div>
          </div>
        </div>

        <div className="gh-header__info">
          <div className="gh-header__avatar-wrap">
            <img
              className="gh-header__avatar"
              src={GUILD_ASSETS.avatar}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="gh-header__meta">
            <div className="gh-header__title-row">
              <h1 className="gh-header__name">梓渝公会</h1>
              <button type="button" className="gh-header__checkin" onClick={() => setCheckinOpen(true)}>
                <img
                  className="gh-header__checkin-bg"
                  src={GUILD_ASSETS.checkinBtnBg}
                  alt=""
                  aria-hidden="true"
                />
                <span className="gh-header__checkin-label">签到</span>
              </button>
            </div>
            <button type="button" className="gh-header__members">
              9888989个成员
              <IconArrow />
            </button>
            <div className="gh-header__chips">
              <button type="button" className="gh-chip gh-chip--glass gh-chip--influence">
                <span className="gh-chip__avatars" aria-hidden="true">
                  {MEMBER_AVATARS.map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="gh-chip__label">成员影响力</span>
                <IconArrow />
              </button>
              <button type="button" className="gh-chip gh-chip--glass gh-chip--chat">
                <span className="gh-chip__chart-wrap" aria-hidden="true">
                  <FigmaIcon className="gh-chip__chart-icon" src={GUILD_ASSETS.icons.chart} />
                </span>
                <span className="gh-chip__label">群聊大厅</span>
                <IconArrow />
              </button>
            </div>
          </div>
        </div>

        <PresidentCard />
      </header>

      <main className="gh-content">
        <div className="gh-strip" role="note">
          <span className="gh-strip__icon-wrap gh-strip__icon-wrap--megaphone" aria-hidden="true">
            <FigmaIcon className="gh-strip__icon" src={GUILD_ASSETS.icons.megaphone} />
          </span>
          <p className="gh-strip__text">{GUILD_ANNOUNCEMENT}</p>
        </div>

        <section className="gh-president" aria-labelledby="president-tasks-title">
          <PresidentTaskCard />
        </section>

        <div className="gh-strip gh-strip--activity">
          <FigmaIcon className="gh-strip__icon" src={GUILD_ASSETS.icons.sparkle} />
          <p className="gh-strip__text">暂无公会活动</p>
          <Link to="/guild/activities" className="gh-strip__action">
            去发起
            <IconArrow />
          </Link>
        </div>

        <section className="gh-games" aria-labelledby="games-title">
          <SectionHead
            icon={<FigmaIcon className="gh-section__icon-img" src={GUILD_ASSETS.icons.gamepad} />}
            title="今日都在玩的梓渝小游戏"
            titleId="games-title"
          />
          <div className="wd-scroll-x gh-games__list" role="list" aria-label="小游戏列表">
            {MINI_GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        <section className="gh-influence" aria-labelledby="influence-title">
          <div className="gh-influence__panel">
            <img
              className="gh-influence__sparkle"
              src={GUILD_ASSETS.sparkle}
              alt=""
              aria-hidden="true"
            />
            <h2 id="influence-title" className="gh-influence__title">
              粉丝影响力TOP3
            </h2>
            <div className="gh-influence__stage">
              <div className="gh-influence__podium">
                {INFLUENCE_TOP3.map((leader) => (
                  <InfluenceSlot key={leader.id} leader={leader} />
                ))}
              </div>
              <img
                className="gh-influence__podium-art"
                src={GUILD_ASSETS.podium}
                alt=""
                aria-hidden="true"
              />
            </div>
            <button type="button" className="gh-influence__cta">
              查看我的影响力
            </button>
          </div>
        </section>

        <section className="gh-chats" aria-labelledby="chats-title">
          <SectionHead icon={<IconChatHall />} title="群聊大厅" titleId="chats-title" />
          <div className="gh-chats__list">
            {CHAT_GROUPS.map((group) => (
              <ChatRow key={group.id} group={group} />
            ))}
          </div>
          <button type="button" className="gh-chats__all">
            查看全部群聊
          </button>
        </section>

        <p className="gh-end" role="status">
          被你看了个底朝天～
        </p>
      </main>

      <footer className="gh-footer" aria-label="底部操作">
        <div className="gh-footer__fade" aria-hidden="true" />
        <div className="gh-footer__bar">
          <button type="button" className="gh-footer__round" aria-label="更多">
            <IconMore />
          </button>
          <button type="button" className="gh-footer__round" aria-label="邀请成员">
            <IconAddPeople />
          </button>
          <button type="button" className="gh-footer__primary">
            <IconStartActivity />
            发起活动
          </button>
        </div>
      </footer>

      <CheckinModal open={checkinOpen} onClose={() => setCheckinOpen(false)} />
    </div>
  )
}
