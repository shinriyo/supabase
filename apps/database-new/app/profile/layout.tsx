'use client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="px-4 xl:px-0 xl:max-w-4xl mx-auto h-full">{children}</div>
}
