import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getDayOfWeek } from '../lib/dates'

export interface DayProgress {
  dateStr: string
  total: number
  approved: number
  pending: number        // not yet acted on
  pendingApproval: number
  rejected: number
  isComplete: boolean    // all chores approved
  isPast: boolean        // date is in the past or today
}

export interface WeekProgress {
  days: DayProgress[]
  totalChores: number
  totalApproved: number
  /** Days that have at least one chore and are past/today */
  scorableDays: number
  /** Days where all chores are approved */
  completedDays: number
}

export function useWeekProgress(weekDays: string[]) {
  return useQuery({
    queryKey: ['week-progress', weekDays[0]],
    refetchInterval: 15_000,
    queryFn: async (): Promise<WeekProgress> => {
      const today = new Date().toISOString().slice(0, 10)

      // Fetch all active chores
      const { data: chores, error: choresError } = await supabase
        .from('chores')
        .select('*')
        .eq('is_active', true)
      if (choresError) throw choresError

      const dailyChores = (chores ?? []).filter((c) => c.frequency === 'daily')
      const weeklyChores = (chores ?? []).filter((c) => c.frequency === 'weekly')

      // Fetch all instances for the week
      const allChoreIds = (chores ?? []).map((c) => c.id)
      const { data: instances, error: instancesError } = allChoreIds.length > 0
        ? await supabase
            .from('chore_instances')
            .select('*')
            .in('chore_id', allChoreIds)
            .gte('due_date', weekDays[0])
            .lte('due_date', weekDays[weekDays.length - 1])
        : { data: [], error: null }
      if (instancesError) throw instancesError

      // Build a map: chore_id__due_date -> status
      const instanceMap = new Map(
        (instances ?? []).map((i) => [`${i.chore_id}__${i.due_date}`, i.status])
      )

      const days: DayProgress[] = weekDays.map((dateStr) => {
        const dow = getDayOfWeek(dateStr)
        const isPast = dateStr <= today

        // Chores due this day
        const dueChores = [
          ...dailyChores,
          ...weeklyChores.filter((c) => c.day_of_week === dow),
        ]

        const total = dueChores.length
        let approved = 0
        let pendingApproval = 0
        let rejected = 0
        let pending = 0

        dueChores.forEach((chore) => {
          const status = instanceMap.get(`${chore.id}__${dateStr}`) ?? 'pending'
          if (status === 'approved') approved++
          else if (status === 'pending_approval') pendingApproval++
          else if (status === 'rejected') rejected++
          else pending++
        })

        return {
          dateStr,
          total,
          approved,
          pending,
          pendingApproval,
          rejected,
          isComplete: total > 0 && approved === total,
          isPast,
        }
      })

      const pastDays = days.filter((d) => d.isPast && d.total > 0)
      const totalChores = pastDays.reduce((sum, d) => sum + d.total, 0)
      const totalApproved = pastDays.reduce((sum, d) => sum + d.approved, 0)

      return {
        days,
        totalChores,
        totalApproved,
        scorableDays: pastDays.length,
        completedDays: pastDays.filter((d) => d.isComplete).length,
      }
    },
  })
}
