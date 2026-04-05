import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Chore = Database['public']['Tables']['chores']['Row']
export type ChoreInstance = Database['public']['Tables']['chore_instances']['Row']
export type ChoreStatus = ChoreInstance['status']

/** A chore merged with its instance for a specific date */
export interface ChoreWithInstance extends Chore {
  instance: ChoreInstance | null
}

/** A chore instance joined with its chore details */
export interface InstanceWithChore extends ChoreInstance {
  chore: Chore
}
