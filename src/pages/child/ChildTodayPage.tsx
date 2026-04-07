import { useState } from 'react'
import { useChoresForDate } from '../../hooks/useChoresForDate'
import { useMarkComplete, useUndoComplete } from '../../hooks/useChoreActions'
import { ChoreCard } from '../../components/chores/ChoreCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { DateNavigator } from '../../components/ui/DateNavigator'
import { getTodayString, toDateString, formatFullDate, subDays, addDays, parseDateString } from '../../lib/dates'
import { ListChecks } from 'lucide-react'
import type { ChoreWithInstance } from '../../types/app.types'

export function ChildTodayPage() {
  const todayStr = getTodayString()
  const [dateStr, setDateStr] = useState(todayStr)

  const { data, isLoading, error } = useChoresForDate(dateStr)
  const markComplete = useMarkComplete()
  const undoComplete = useUndoComplete()

  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr
  const canAct = isToday || isPast

  async function handleMarkDone(choreId: string, instanceId: string | null) {
    await markComplete.mutateAsync({ choreId, instanceId, dueDate: dateStr })
  }

  const groups = data?.groups ?? []
  const flat = data?.flat ?? []
  const approved = flat.filter((c) => c.instance?.status === 'approved')
  const hasChores = flat.length > 0

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-5">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {isToday ? "Today's Chores" : formatFullDate(dateStr)}
        </h1>
        <DateNavigator
          label={isToday ? 'Today' : formatFullDate(dateStr).split(',')[0]}
          onPrev={() => setDateStr(toDateString(subDays(parseDateString(dateStr), 1)))}
          onNext={() => setDateStr(toDateString(addDays(parseDateString(dateStr), 1)))}
          disableNext={isToday}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load chores. Please refresh.
        </div>
      )}

      {!isLoading && !hasChores && (
        <EmptyState
          icon={<ListChecks size={32} />}
          title="No chores for this day"
          description="Nothing to do here!"
        />
      )}

      {!isLoading && hasChores && (
        <>
          {/* Pending chores grouped by category */}
          {groups.map((group) => {
            const pending = group.chores.filter(c => c.instance?.status !== 'approved')
            if (pending.length === 0) return null
            return (
              <div key={group.category?.id ?? 'uncategorised'} className="space-y-2">
                {group.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    {group.category.name}
                  </p>
                )}
                {pending.map((item) => (
                  <ChoreCard
                    key={item.id}
                    item={item}
                    isChild={canAct}
                    onMarkDone={handleMarkDone}
                    onUndo={(instanceId) => undoComplete.mutate(instanceId)}
                  />
                ))}
              </div>
            )
          })}

          {/* Approved chores */}
          {approved.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Done</p>
              {approved.map((item: ChoreWithInstance) => (
                <ChoreCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
