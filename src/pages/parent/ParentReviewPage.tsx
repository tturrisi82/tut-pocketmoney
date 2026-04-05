import { usePendingApprovals } from '../../hooks/usePendingApprovals'
import { useApproveChore, useRejectChore } from '../../hooks/useChoreActions'
import { ApprovalActions } from '../../components/chores/ApprovalActions'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDayLabel } from '../../lib/dates'
import { CheckCircle2 } from 'lucide-react'

export function ParentReviewPage({ reviewerId }: { reviewerId: string }) {
  const { data: pending, isLoading, error } = usePendingApprovals()
  const approve = useApproveChore(reviewerId)
  const reject = useRejectChore(reviewerId)

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Review</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chores waiting for your approval</p>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load pending approvals.
        </div>
      )}

      {!isLoading && pending?.length === 0 && (
        <EmptyState
          icon={<CheckCircle2 size={32} />}
          title="All caught up!"
          description="No chores waiting for approval."
        />
      )}

      {!isLoading && pending?.map((instance) => (
        <div key={instance.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">{instance.chore.title}</p>
              {instance.chore.description && (
                <p className="text-sm text-gray-500 mt-0.5">{instance.chore.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Due: {formatDayLabel(instance.due_date)}
                {instance.completed_at && (
                  <> · Marked done: {new Date(instance.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <ApprovalActions
              instanceId={instance.id}
              choreTitle={instance.chore.title}
              onApprove={(id) => approve.mutateAsync(id)}
              onReject={(id, note) => reject.mutateAsync({ instanceId: id, note })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
