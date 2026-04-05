import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getDayOfWeek } from '../lib/dates'
import type { ChoreWithInstance } from '../types/app.types'

export interface WeeklyChoreDay {
  dateStr: string
  dayOfWeek: number
  chores: ChoreWithInstance[]
}

/**
 * Fetches all weekly chores and their instances for a given week range.
 * Returns chores grouped by their due date within the week.
 */
export function useChoresForWeek(weekDays: string[]) {
  return useQuery({
    queryKey: ['chore-instances', 'weekly', weekDays[0]],
    queryFn: async () => {
      if (weekDays.length === 0) return []

      // 1. Fetch all active weekly chores
      const { data: chores, error: choresError } = await supabase
        .from('chores')
        .select('*')
        .eq('frequency', 'weekly')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
      if (choresError) throw choresError

      if (!chores || chores.length === 0) return buildEmptyWeek(weekDays)

      // 2. Fetch existing instances for the week range
      const { data: instances, error: instancesError } = await supabase
        .from('chore_instances')
        .select('*')
        .in('chore_id', chores.map((c) => c.id))
        .gte('due_date', weekDays[0])
        .lte('due_date', weekDays[weekDays.length - 1])
      if (instancesError) throw instancesError

      // 3. For each day, find matching chores and their instance
      const instanceMap = new Map(
        (instances ?? []).map((i) => [`${i.chore_id}__${i.due_date}`, i])
      )

      // Group days: for each weekday, find chores whose day_of_week matches
      const result: WeeklyChoreDay[] = weekDays.map((dateStr) => {
        const dow = getDayOfWeek(dateStr)
        const dayChores = chores.filter((c) => c.day_of_week === dow)
        return {
          dateStr,
          dayOfWeek: dow,
          chores: dayChores.map((chore) => ({
            ...chore,
            instance: instanceMap.get(`${chore.id}__${dateStr}`) ?? null,
          })),
        }
      })

      // 4. Upsert missing instances for past/today dates (not future)
      const today = new Date().toISOString().slice(0, 10)
      const toUpsert: { chore_id: string; due_date: string; status: 'pending' }[] = []
      result.forEach(({ dateStr, chores: dayChores }) => {
        if (dateStr > today) return // don't pre-create future instances
        dayChores.forEach(({ id: choreId, instance }) => {
          if (!instance) {
            toUpsert.push({ chore_id: choreId, due_date: dateStr, status: 'pending' })
          }
        })
      })

      if (toUpsert.length > 0) {
        await supabase
          .from('chore_instances')
          .upsert(toUpsert, { onConflict: 'chore_id,due_date', ignoreDuplicates: true })
      }

      return result
    },
  })
}

function buildEmptyWeek(weekDays: string[]): WeeklyChoreDay[] {
  return weekDays.map((dateStr) => ({
    dateStr,
    dayOfWeek: getDayOfWeek(dateStr),
    chores: [],
  }))
}
