import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AppSettings {
  weekly_target: number
}

export function useSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('weekly_target')
        .single()
      if (error) throw error
      return { weekly_target: Number(data.weekly_target) }
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      const { error } = await supabase
        .from('app_settings')
        .update(settings)
        .eq('id', 1)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-settings'] }),
  })
}
