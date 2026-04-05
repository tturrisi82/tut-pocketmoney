import { useChoreHistory } from '../../hooks/useChoreHistory'
import { getTodayString, formatDayLabel } from '../../lib/dates'
import { StatusBadge } from '../../components/chores/StatusBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { History } from 'lucide-react'

export function ChildHistoryPage() {
  const today = getTodayString()
  const { data: history, isLoading, error } = useChoreHistory(today)

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-lg font-semibold text-gray-900">History</h1>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load history.
        </div>
      )}

      {!isLoading && history?.length === 0 && (
        <EmptyState
          icon={<History size={32} />}
          title="No history yet"
          description="Your past chores will appear here."
        />
      )}

      {!isLoading && history?.map(({ dateStr, instances }) => {
        const hasIncomplete = instances.some((i) => i.status === 'pending' || i.status === 'rejected')
        return (
          <div key={dateStr} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">{formatDayLabel(dateStr)}</p>
              {hasIncomplete && (
                <span className="text-xs text-red-500 font-medium">● Incomplete</span>
              )}
            </div>
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  instance.status === 'approved'
                    ? 'border-emerald-200 bg-emerald-50'
                    : instance.status === 'pending' || instance.status === 'rejected'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex-1">
                  <p className={`text-sm font-medium ${instance.status === 'approved' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {instance.chore.title}
                  </p>
                  {instance.rejection_note && (
                    <p className="mt-0.5 text-xs text-red-600">{instance.rejection_note}</p>
                  )}
                </div>
                <StatusBadge status={instance.status} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
