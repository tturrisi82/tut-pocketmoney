import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { InstanceWithChore } from '../types/app.types'

const PAGE_SIZE = 50

export interface HistoryDay {
  dateStr: string
  instances: InstanceWithChore[]
}

/**
 * Loads chore history (past instances), grouped by date, most recent first.
 * Excludes today's instances.
 */
export function useChoreHistory(beforeDate: string) {
  return useQuery({
    queryKey: ['chore-history', beforeDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_instances')
        .select('*, chore:chores(*)')
        .lt('due_date', beforeDate)
        .order('due_date', { ascending: false })
        .limit(PAGE_SIZE)
      if (error) throw error

      // Group by date
      const byDate = new Map<string, InstanceWithChore[]>()
      for (const row of (data ?? []) as InstanceWithChore[]) {
        const day = byDate.get(row.due_date) ?? []
        day.push(row)
        byDate.set(row.due_date, day)
      }

      return Array.from(byDate.entries()).map(([dateStr, instances]) => ({
        dateStr,
        instances,
      })) as HistoryDay[]
    },
  })
}
