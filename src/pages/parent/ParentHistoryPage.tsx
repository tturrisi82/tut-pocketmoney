import { useChoreHistory } from '../../hooks/useChoreHistory'
import { getTodayString, formatDayLabel } from '../../lib/dates'
import { StatusBadge } from '../../components/chores/StatusBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { History } from 'lucide-react'

export function ParentHistoryPage() {
  const today = getTodayString()
  const { data: history, isLoading, error } = useChoreHistory(today)

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">History</h1>
        <p className="text-sm text-gray-500 mt-0.5">Past chore completions</p>
      </div>

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
          description="Completed chores will appear here."
        />
      )}

      {!isLoading && history?.map(({ dateStr, instances }) => (
        <div key={dateStr} className="space-y-2">
          <p className="text-sm font-semibold text-gray-600">{formatDayLabel(dateStr)}</p>
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{instance.chore.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  {instance.completed_at && (
                    <span>Done: {new Date(instance.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  {instance.reviewed_at && (
                    <span>Reviewed: {new Date(instance.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
                {instance.rejection_note && (
                  <p className="mt-1 text-xs text-red-600">Note: {instance.rejection_note}</p>
                )}
              </div>
              <StatusBadge status={instance.status} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
