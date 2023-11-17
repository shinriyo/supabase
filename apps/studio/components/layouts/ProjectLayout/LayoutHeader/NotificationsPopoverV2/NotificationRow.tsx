import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Button, IconAlertCircle, IconAlertTriangle, IconArchive } from 'ui'

import { Markdown } from 'components/interfaces/Markdown'
import { Notification, NotificationData } from 'data/notifications/notifications-v2-query'
import { Organization, Project } from 'types'

interface NotificationRowProps {
  index: number
  listRef: any
  item: Notification
  setRowHeight: (idx: number, height: number) => void
  getProject: (id: number) => Project
  getOrganization: (id: number) => Organization
}

const NotificationRow = ({
  index,
  listRef,
  item: notification,
  setRowHeight,
  getProject,
  getOrganization,
}: NotificationRowProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { status, priority } = notification
  // @ts-ignore
  const data = notification.data as NotificationData
  const project = data.project_id !== undefined ? getProject(data.project_id) : undefined
  const organization = project !== undefined ? getOrganization(project.organization_id) : undefined

  const daysFromNow = dayjs().diff(dayjs(notification.inserted_at), 'day')
  const formattedTimeFromNow = dayjs(notification.inserted_at).fromNow()
  const formattedInsertedAt = dayjs(notification.inserted_at).format('DD MMM YYYY, HH:mm:ss (ZZ)')

  const onButtonAction = (type?: string) => {
    // [Joshen] Implement accordingly - BE team will need to give us a heads up on this
    console.log('Action', type)
  }

  useEffect(() => {
    if (ref.current) {
      listRef.current.resetAfterIndex(0)
      setRowHeight(index, ref.current.clientHeight)
    }
  }, [ref])

  return (
    <div
      ref={ref}
      className={clsx(
        `p-4 flex justify-between gap-x-3`,
        index !== 0 ? 'border-t' : '',
        status !== 'new' ? 'bg-background' : ''
      )}
    >
      <div className="flex flex-col gap-y-2 w-full">
        {(project !== undefined || organization !== undefined) && (
          <div className="flex items-center">
            {organization !== undefined && (
              <Link
                href={`/org/${organization.slug}/general`}
                className="text-xs transition text-foreground-light hover:text-foreground underline"
              >
                {organization.name}
              </Link>
            )}
            {organization !== undefined && project !== undefined && (
              <span className="text-foreground-lighter">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  shapeRendering="geometricPrecision"
                >
                  <path d="M16 3.549L7.12 20.600"></path>
                </svg>
              </span>
            )}
            {project !== undefined && (
              <Link
                href={`/project/${project.ref}`}
                className="text-xs transition text-foreground-light hover:text-foreground underline"
              >
                {project.name}
              </Link>
            )}
          </div>
        )}
        <div className="flex items-center gap-x-2">
          <p className="text-sm max-w-[80%] break-all">{data.title}</p>
          <p className="text-xs text-foreground-light capitalize-sentence">
            {daysFromNow > 1 ? formattedInsertedAt : formattedTimeFromNow}
          </p>
        </div>
        {data.message !== undefined && (
          <Markdown className="text-foreground-light text-xs" content={data.message} />
        )}
        {(data.actions ?? []).length > 0 && (
          <div className="flex items-center gap-x-2">
            {data.actions.map((action, idx) => {
              const key = `${notification.id}-action-${idx}`
              if (action.url !== undefined) {
                return (
                  <Button key={key} type="outline">
                    <Link href={action.url} target="_blank" rel="noreferrer">
                      {action.label}
                    </Link>
                  </Button>
                )
              } else if (action.action_type !== undefined) {
                return (
                  <Button
                    key={key}
                    type="outline"
                    onClick={() => onButtonAction(action.action_type)}
                  >
                    {action.label}
                  </Button>
                )
              } else {
                return null
              }
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-y-2">
        {priority === 'Warning' && (
          <IconAlertCircle
            size={22}
            strokeWidth={2}
            className="rounded p-0.5 text-warning-400 bg-warning-600"
          />
        )}
        {priority === 'Critical' && (
          <IconAlertTriangle
            size={22}
            strokeWidth={2}
            className="rounded p-0.5 text-destructive-400 bg-destructive-600"
          />
        )}
        <Tooltip.Root delayDuration={0}>
          <Tooltip.Trigger asChild>
            <Button type="outline" icon={<IconArchive />} className="px-1" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="bottom">
              <Tooltip.Arrow className="radix-tooltip-arrow" />
              <div
                className={[
                  'rounded bg-alternative py-1 px-2 leading-none shadow',
                  'border border-background',
                ].join(' ')}
              >
                <span className="text-xs text-foreground">Archive</span>
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </div>
  )
}

export default NotificationRow
