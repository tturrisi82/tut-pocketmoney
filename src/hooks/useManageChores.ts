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
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as Chore[]
    },
  })
}

// Includes inactive chores for the management UI
export function useAllChores() {
  return useQuery({
    queryKey: ['chores', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .order('sort_order', { ascending: true })
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
  category_id?: string | null
  sort_order?: number
  is_active?: boolean
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
        category_id: values.category_id ?? null,
        sort_order: values.sort_order ?? 0,
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
        category_id: values.category_id ?? null,
        ...(values.sort_order !== undefined ? { sort_order: values.sort_order } : {}),
        ...(values.is_active !== undefined ? { is_active: values.is_active } : {}),
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
      const { error } = await supabase.from('chores').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chores'] })
      qc.invalidateQueries({ queryKey: ['chore-instances'] })
    },
  })
}

export function useReorderChores() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ordered: { id: string; sort_order: number }[]) => {
      await Promise.all(
        ordered.map(({ id, sort_order }) =>
          supabase.from('chores').update({ sort_order }).eq('id', id)
        )
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}
