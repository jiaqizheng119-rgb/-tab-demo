import { useState } from 'react'
import { GUILD_ASSETS, PRESIDENT_TASKS } from '../data/guildHome'
import { PublishActivitySheet } from './PublishActivitySheet'

type PresidentTaskCardProps = {
  titleId?: string
  onMoreTasks?: () => void
}

function TaskRow({
  task,
  onPublish,
}: {
  task: (typeof PRESIDENT_TASKS)[number]
  onPublish?: () => void
}) {
  const handleClick = () => {
    if (task.id === 'p1') onPublish?.()
  }

  return (
    <article className="gh-president-row">
      <p className="gh-president-row__title">
        {task.title}
        <span className="gh-president-row__progress">（{task.progress}）</span>
      </p>
      <button type="button" className="gh-btn-primary" onClick={handleClick}>
        {task.cta}
      </button>
    </article>
  )
}

export function PresidentTaskCard({
  titleId = 'president-tasks-title',
  onMoreTasks,
}: PresidentTaskCardProps) {
  const [publishOpen, setPublishOpen] = useState(false)

  return (
    <>
      <article className="gh-task-shell" aria-labelledby={titleId}>
      <div className="gh-task-shell__bg" aria-hidden="true" />
      <img
        className="gh-task-shell__tab"
        src={GUILD_ASSETS.taskShellTab}
        alt=""
        aria-hidden="true"
      />
      <div className="gh-task-shell__tab-action">
        <button type="button" className="gh-president__more" onClick={onMoreTasks}>
          更多任务
          <img
            className="gh-president__more-arrow"
            src={GUILD_ASSETS.icons.arrowMore}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="gh-task-shell__content">
        <div className="gh-task-shell__head">
          <div className="gh-task-shell__title-blur" aria-hidden="true" />
          <h2 id={titleId} className="gh-task-shell__title">
            完成以下任务，解锁会长成就
          </h2>
        </div>

        <div className="gh-president__achievement">
          <div className="gh-president__badge" aria-hidden="true">
            <img
              className="gh-president__badge-img"
              src={GUILD_ASSETS.achievementBadgeBase}
              alt=""
              loading="lazy"
            />
            <img
              className="gh-president__badge-img gh-president__badge-img--overlay"
              src={GUILD_ASSETS.achievementBadgeOverlay}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="gh-president__achievement-body">
            <p className="gh-president__achievement-text">
              完成以下任务后，能获得XXX成就
            </p>
            <div className="gh-president__steps" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="gh-president__list">
          {PRESIDENT_TASKS.map((task) => (
            <TaskRow key={task.id} task={task} onPublish={() => setPublishOpen(true)} />
          ))}
        </div>
      </div>
    </article>

      <PublishActivitySheet open={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  )
}
