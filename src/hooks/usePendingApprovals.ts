import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { InstanceWithChore } from '../types/app.types'

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['chore-instances', 'pending-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_instances')
        .select('*, chore:chores(*)')
        .eq('status', 'pending_approval')
        .order('completed_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as InstanceWithChore[]
    },
    refetchInterval: 30_000, // poll every 30s so parent sees new approvals promptly
  })
}

export function usePendingCount(): number {
  const { data } = usePendingApprovals()
  return data?.length ?? 0
}
