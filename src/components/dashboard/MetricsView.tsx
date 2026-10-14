'use client'

import { ReactNode, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import useSWR from 'swr'
import type { ApexOptions } from 'apexcharts'
import CardBox from '@/components/shared/CardBox'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import { Badge } from '@/components/ui/badge'
import { ErrorState, LoadingState, EmptyState } from '@/components/shared/StateViews'
import SelectField from '@/components/shared/SelectField'
import { api } from '@/lib/api-client'
import { safeInternalUrl } from '@/lib/permissions'
import { timeAgo } from '@/lib/formatters'
import type { ChartDef, MetricsPayload } from '@/types/api'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

function hasData(c: ChartDef) {
  return c.series.some((s) => s.data.some((n) => Number(n) !== 0))
}

function ChartCard({ c }: { c: ChartDef }) {
  const donut = c.type === 'donut'
  const options: ApexOptions = {
    chart: { type: c.type, toolbar: { show: false }, fontFamily: 'inherit', foreColor: '#adb0bb' },
    colors: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-success)', 'var(--color-info)'],
    stroke: { width: donut ? 0 : 2, curve: 'smooth' },
    dataLabels: { enabled: false },
    legend: { show: donut || c.series.length > 1, position: 'bottom' },
    tooltip: { theme: 'dark' },
    ...(donut ? { labels: c.labels ?? [] } : { xaxis: { categories: c.categories ?? [] } }),
    ...(c.type === 'bar' ? { plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } } } : {}),
  }
  const series = donut ? (c.series[0]?.data ?? []) : c.series
  return (
    <CardBox className='p-6'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <h3 className='text-base font-semibold'>{c.title}</h3>
        {c.estimated && <Badge variant='lightWarning'>Estimate</Badge>}
      </div>
      {hasData(c) ? (
        <Chart options={options} series={series as ApexOptions['series']} type={c.type} height={280} width='100%' />
      ) : (
        <EmptyState title='No data for this period' />
      )}
    </CardBox>
  )
}

/** Renders stats and charts exactly as calculated by the backend. Nothing here is invented or random. */
export default function MetricsView({
  title, crumbs, endpoint, ranges, headerActions, intro,
}: {
  title: string
  crumbs: { title: string; to?: string }[]
  endpoint: string
  /** day ranges offered in the date filter; omit to hide the filter */
  ranges?: number[]
  headerActions?: ReactNode
  intro?: ReactNode
}) {
  const [range, setRange] = useState(ranges ? String(ranges[Math.min(1, ranges.length - 1)]) : '')
  const { data, error, isLoading, mutate } = useSWR(
    [endpoint, range],
    () => api.get<MetricsPayload>(endpoint, range ? { range_days: range } : undefined),
    { shouldRetryOnError: false, refreshInterval: 120000, refreshWhenHidden: false },
  )

  return (
    <>
      <BreadcrumbComp title={title} items={crumbs} />
      {(ranges || headerActions) && (
        <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
          <div>{headerActions}</div>
          {ranges && (
            <div className='w-44'>
              <label htmlFor='metrics-range' className='mb-1 block text-xs text-muted-foreground'>Period</label>
              <SelectField id='metrics-range' value={range} onChange={setRange} options={ranges.map((r) => ({ value: String(r), label: `Last ${r} days` }))} />
            </div>
          )}
        </div>
      )}
      {intro}
      {isLoading && <LoadingState label='Loading dashboard' />}
      {error && !isLoading && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
      {data && (
        <div className='space-y-6'>
          {data.stats.length > 0 && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              {data.stats.map((s) => {
                const href = safeInternalUrl(s.href)
                const card = (
                  <CardBox className={`p-5 ${href ? 'transition-shadow hover:shadow-md' : ''}`}>
                    <p className='text-sm text-muted-foreground'>{s.label}</p>
                    <p className='mt-1 text-2xl font-bold'>{s.value}</p>
                    {s.hint && <p className='mt-1 text-xs text-muted-foreground'>{s.hint}</p>}
                    {href && <p className='mt-2 text-xs font-medium text-primary'>View tickets</p>}
                  </CardBox>
                )
                return href ? <Link key={s.key} href={href} aria-label={`${s.label}: ${s.value}. View tickets`}>{card}</Link> : <div key={s.key}>{card}</div>
              })}
            </div>
          )}
          {data.charts.length > 0 && (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>{data.charts.map((c) => <ChartCard key={c.key} c={c} />)}</div>
          )}
          {data.announcements && data.announcements.length > 0 && (
            <CardBox className='p-6'>
              <h3 className='mb-3 text-base font-semibold'>Announcements</h3>
              <ul className='space-y-3'>
                {data.announcements.map((a) => (
                  <li key={a.id} className='text-sm'>
                    <p className='font-medium'>{a.title} <Badge variant='gray' className='ml-1'>{a.category}</Badge></p>
                    <p className='text-xs text-muted-foreground'>{timeAgo(a.published_at)}</p>
                  </li>
                ))}
              </ul>
            </CardBox>
          )}
          {data.recent && (
            <CardBox className='p-6'>
              <h3 className='mb-3 text-base font-semibold'>Recent activity</h3>
              {data.recent.length === 0 ? <EmptyState title='No recent activity' /> : (
                <ul className='space-y-3'>
                  {data.recent.map((r) => {
                    const url = safeInternalUrl(r.url)
                    return (
                      <li key={r.id} className='flex items-start justify-between gap-3 text-sm'>
                        <span className='min-w-0 break-words'>{url ? <Link href={url} className='hover:text-primary'>{r.text}</Link> : r.text}</span>
                        <span className='shrink-0 text-xs text-muted-foreground'>{timeAgo(r.time)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardBox>
          )}
          {data.stats.length === 0 && data.charts.length === 0 && !data.recent && <EmptyState title='No data yet' />}
        </div>
      )}
    </>
  )
}
