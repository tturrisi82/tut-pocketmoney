import { useState } from 'react'
import { useChoresForDate } from '../../hooks/useChoresForDate'
import { useMarkComplete, useUndoComplete } from '../../hooks/useChoreActions'
import { ChoreCard } from '../../components/chores/ChoreCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { DateNavigator } from '../../components/ui/DateNavigator'
import { getTodayString, toDateString, formatFullDate, subDays, addDays, parseDateString } from '../../lib/dates'
import { ListChecks } from 'lucide-react'

export function ChildTodayPage() {
  const todayStr = getTodayString()
  const [dateStr, setDateStr] = useState(todayStr)

  const { data: chores, isLoading, error } = useChoresForDate(dateStr)
  const markComplete = useMarkComplete()
  const undoComplete = useUndoComplete()

  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr

  async function handleMarkDone(choreId: string, instanceId: string | null) {
    await markComplete.mutateAsync({ choreId, instanceId, dueDate: dateStr })
  }

  const approved = chores?.filter((c) => c.instance?.status === 'approved') ?? []
  const pending = chores?.filter((c) => c.instance?.status !== 'approved') ?? []

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

      {!isLoading && chores?.length === 0 && (
        <EmptyState
          icon={<ListChecks size={32} />}
          title="No chores for this day"
          description="Nothing to do here!"
        />
      )}

      {!isLoading && chores && chores.length > 0 && (
        <>
          {/* Pending/in-progress chores */}
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((item) => (
                <ChoreCard
                  key={item.id}
                  item={item}
                  isChild={isToday || isPast}
                  onMarkDone={handleMarkDone}
                  onUndo={(instanceId) => undoComplete.mutate(instanceId)}
                />
              ))}
            </div>
          )}

          {/* Approved chores */}
          {approved.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Done</p>
              {approved.map((item) => (
                <ChoreCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
