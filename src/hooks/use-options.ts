'use client'
import useSWR from 'swr'
import { api } from '@/lib/api-client'
import type { Option } from '@/types/api'

/** Loads select options from the API (e.g. /options/departments) so lists are never hardcoded. */
export function useOptions(endpoint?: string) {
  const { data, error, isLoading } = useSWR(endpoint ? ['options', endpoint] : null, () => api.get<{ data: Option[] }>(endpoint!), { shouldRetryOnError: false })
  return { options: data?.data ?? [], error: !!error, loading: isLoading }
}
