import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/** Child marks a chore as complete (creates instance if needed, sets pending_approval) */
export function useMarkComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      choreId,
      instanceId,
      dueDate,
    }: {
      choreId: string
      instanceId: string | null
      dueDate: string
    }) => {
      if (instanceId) {
        // Update existing instance
        const { error } = await supabase
          .from('chore_instances')
          .update({ status: 'pending_approval', completed_at: new Date().toISOString() })
          .eq('id', instanceId)
        if (error) throw error
      } else {
        // Upsert (instance may not exist yet)
        const { error } = await supabase.from('chore_instances').upsert(
          {
            chore_id: choreId,
            due_date: dueDate,
            status: 'pending_approval',
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'chore_id,due_date' }
        )
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chore-instances'] }),
  })
}

/** Parent approves a chore completion */
export function useApproveChore(reviewerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const { error } = await supabase
        .from('chore_instances')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
        })
        .eq('id', instanceId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chore-instances'] }),
  })
}

/** Parent rejects a chore completion */
export function useRejectChore(reviewerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ instanceId, note }: { instanceId: string; note: string }) => {
      const { error } = await supabase
        .from('chore_instances')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          rejection_note: note || null,
        })
        .eq('id', instanceId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chore-instances'] }),
  })
}
