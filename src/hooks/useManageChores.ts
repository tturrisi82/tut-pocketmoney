import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Chore } from '../types/app.types'

export function useChores() {
  return useQuery({
    queryKey: ['chores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Chore[]
    },
  })
}

export interface ChoreInput {
  title: string
  description?: string | null
  frequency: 'daily' | 'weekly'
  day_of_week?: number | null
}

export function useCreateChore(createdBy: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: ChoreInput) => {
      const { error } = await supabase.from('chores').insert({
        title: values.title,
        description: values.description ?? null,
        frequency: values.frequency,
        day_of_week: values.day_of_week ?? null,
        created_by: createdBy,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}

export function useUpdateChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: ChoreInput & { id: string }) => {
      const { error } = await supabase.from('chores').update({
        title: values.title,
        description: values.description ?? null,
        frequency: values.frequency,
        day_of_week: values.day_of_week ?? null,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}

export function useDeleteChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete: set is_active = false
      const { error } = await supabase.from('chores').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] })
      qc.invalidateQueries({ queryKey: ['chore-instances'] })
    },
  })
}
