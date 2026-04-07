import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category } from '../types/app.types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCreateCategory(createdBy: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, sort_order }: { name: string; sort_order: number }) => {
      const { error } = await supabase.from('categories').insert({ name, sort_order, created_by: createdBy })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Category> & { id: string }) => {
      const { error } = await supabase.from('categories').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // Unassign chores from this category first
      await supabase.from('chores').update({ category_id: null }).eq('category_id', id)
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['chores'] })
    },
  })
}

/** Reorder categories by saving new sort_order values for each */
export function useReorderCategories() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ordered: Category[]) => {
      await Promise.all(
        ordered.map((cat, i) =>
          supabase.from('categories').update({ sort_order: i }).eq('id', cat.id)
        )
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
