import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getDayOfWeek } from '../lib/dates'
import type { Chore, ChoreInstance, ChoreWithInstance, Category } from '../types/app.types'

export interface CategoryGroup {
  category: Category | null  // null = uncategorised
  chores: ChoreWithInstance[]
}

/**
 * Fetches all chores due on a given date (daily chores + weekly chores whose
 * day_of_week matches), with instances lazily created. Returns chores grouped
 * by category in category sort_order, then chore sort_order.
 */
export function useChoresForDate(dateStr: string) {
  return useQuery({
    queryKey: ['chore-instances', 'daily', dateStr],
    refetchInterval: 15_000,
    queryFn: async () => {
      const dow = getDayOfWeek(dateStr)

      // 1. Fetch all active chores — daily ones always show, weekly only on their day
      const { data: allChores, error: choresError } = await supabase
        .from('chores')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (choresError) throw choresError

      const chores = (allChores ?? []).filter(
        c => c.frequency === 'daily' || (c.frequency === 'weekly' && c.day_of_week === dow)
      )

      if (chores.length === 0) return { groups: [], flat: [] }

      // 2. Fetch categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      // 3. Fetch existing instances for this date
      const { data: instances, error: instancesError } = await supabase
        .from('chore_instances')
        .select('*')
        .in('chore_id', chores.map((c) => c.id))
        .eq('due_date', dateStr)
      if (instancesError) throw instancesError

      // 4. Upsert missing instances
      const existingIds = new Set(instances?.map((i) => i.chore_id) ?? [])
      const missing = chores.filter((c) => !existingIds.has(c.id))
      let allInstances = instances ?? []

      if (missing.length > 0) {
        await supabase.from('chore_instances').upsert(
          missing.map((c) => ({ chore_id: c.id, due_date: dateStr, status: 'pending' as const })),
          { onConflict: 'chore_id,due_date', ignoreDuplicates: true }
        )
        const { data: refreshed } = await supabase
          .from('chore_instances')
          .select('*')
          .in('chore_id', chores.map((c) => c.id))
          .eq('due_date', dateStr)
        allInstances = refreshed ?? []
      }

      const instanceMap = new Map(allInstances.map((i) => [i.chore_id, i]))
      const merged: ChoreWithInstance[] = chores.map((chore) => ({
        ...chore,
        instance: instanceMap.get(chore.id) ?? null,
      }))

      // 5. Group by category
      const catMap = new Map((categories ?? []).map((c) => [c.id, c]))
      const groups = groupByCategory(merged, categories ?? [], catMap)

      return { groups, flat: merged }
    },
  })
}

function groupByCategory(
  chores: ChoreWithInstance[],
  categories: Category[],
  catMap: Map<string, Category>
): CategoryGroup[] {
  const groups: CategoryGroup[] = []

  for (const cat of categories) {
    const catChores = chores.filter(c => c.category_id === cat.id)
    if (catChores.length > 0) {
      groups.push({ category: cat, chores: catChores })
    }
  }

  const uncategorised = chores.filter(c => !c.category_id || !catMap.has(c.category_id))
  if (uncategorised.length > 0) {
    groups.push({ category: null, chores: uncategorised })
  }

  return groups
}

export function mergeFlat(chores: Chore[], instances: ChoreInstance[]): ChoreWithInstance[] {
  const instanceMap = new Map(instances.map((i) => [i.chore_id, i]))
  return chores.map((chore) => ({ ...chore, instance: instanceMap.get(chore.id) ?? null }))
}
