import { useState } from 'react'
import { useChoresForWeek } from '../../hooks/useChoresForWeek'
import { useMarkComplete } from '../../hooks/useChoreActions'
import { ChoreCard } from '../../components/chores/ChoreCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { DateNavigator } from '../../components/ui/DateNavigator'
import { getTodayString, getWeekRange, formatDayLabel, addDays, subDays } from '../../lib/dates'
import { CalendarDays } from 'lucide-react'

export function ChildWeekPage() {
  const today = getTodayString()
  const [weekAnchor, setWeekAnchor] = useState(new Date())

  const { start, end, days } = getWeekRange(weekAnchor)
  const isCurrentWeek = today >= start && today <= end

  const { data: weekData, isLoading, error } = useChoresForWeek(days)
  const markComplete = useMarkComplete()

  function prevWeek() { setWeekAnchor((d) => subDays(d, 7)) }
  function nextWeek() { setWeekAnchor((d) => addDays(d, 7)) }

  async function handleMarkDone(choreId: string, instanceId: string | null, dueDate: string) {
    await markComplete.mutateAsync({ choreId, instanceId, dueDate })
  }

  const weekLabel = `${formatDayLabel(start)} – ${formatDayLabel(end)}`

  const daysWithChores = weekData?.filter((d) => d.chores.length > 0) ?? []

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {isCurrentWeek ? 'This Week' : 'Weekly Chores'}
        </h1>
        <DateNavigator
          label={isCurrentWeek ? 'This week' : weekLabel}
          onPrev={prevWeek}
          onNext={nextWeek}
          disableNext={isCurrentWeek}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load chores. Please refresh.
        </div>
      )}

      {!isLoading && daysWithChores.length === 0 && (
        <EmptyState
          icon={<CalendarDays size={32} />}
          title="No weekly chores set up"
          description="Ask a parent to add some weekly chores."
        />
      )}

      {!isLoading && daysWithChores.map(({ dateStr, chores }) => (
        <div key={dateStr} className="space-y-2">
          <p className="text-sm font-semibold text-gray-600">{formatDayLabel(dateStr)}</p>
          {chores.map((item) => (
            <ChoreCard
              key={item.id}
              item={item}
              isChild
              upcoming={dateStr > today}
              onMarkDone={(choreId, instanceId) => handleMarkDone(choreId, instanceId, dateStr)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
