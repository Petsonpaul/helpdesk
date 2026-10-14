'use client'
import useSWR from 'swr'
import { getProfile } from '@/services/profile.service'

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR('me-profile', getProfile, { shouldRetryOnError: false })
  return { profile: data, error: error ? (error as Error).message : '', loading: isLoading, refresh: mutate }
}
