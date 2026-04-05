import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Chore, ChoreInstance, ChoreWithInstance } from '../types/app.types'

/**
 * Fetches all daily chores and their instances for a given date.
 * Lazily upserts instances for any chore that doesn't have one yet.
 */
export function useChoresForDate(dateStr: string) {
  return useQuery({
    queryKey: ['chore-instances', 'daily', dateStr],
    refetchInterval: 15_000,
    queryFn: async () => {
      // 1. Fetch all active daily chores
      const { data: chores, error: choresError } = await supabase
        .from('chores')
        .select('*')
        .eq('frequency', 'daily')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (choresError) throw choresError

      if (!chores || chores.length === 0) return []

      // 2. Fetch existing instances for this date
      const { data: instances, error: instancesError } = await supabase
        .from('chore_instances')
        .select('*')
        .in('chore_id', chores.map((c) => c.id))
        .eq('due_date', dateStr)
      if (instancesError) throw instancesError

      // 3. Upsert missing instances (ignore duplicates)
      const existingIds = new Set(instances?.map((i) => i.chore_id) ?? [])
      const missing = chores.filter((c) => !existingIds.has(c.id))
      if (missing.length > 0) {
        const { error: upsertError } = await supabase.from('chore_instances').upsert(
          missing.map((c) => ({ chore_id: c.id, due_date: dateStr, status: 'pending' as const })),
          { onConflict: 'chore_id,due_date', ignoreDuplicates: true }
        )
        if (upsertError) throw upsertError

        // Re-fetch instances after upsert
        const { data: refreshed, error: refreshError } = await supabase
          .from('chore_instances')
          .select('*')
          .in('chore_id', chores.map((c) => c.id))
          .eq('due_date', dateStr)
        if (refreshError) throw refreshError

        return mergeChoresAndInstances(chores, refreshed ?? [])
      }

      return mergeChoresAndInstances(chores, instances ?? [])
    },
  })
}

function mergeChoresAndInstances(
  chores: Chore[],
  instances: ChoreInstance[]
): ChoreWithInstance[] {
  const instanceMap = new Map(instances.map((i) => [i.chore_id, i]))
  return chores.map((chore) => ({
    ...chore,
    instance: instanceMap.get(chore.id) ?? null,
  }))
}
