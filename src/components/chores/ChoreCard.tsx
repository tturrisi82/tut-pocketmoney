import { CheckCircle2, Circle, Clock, XCircle, Undo2 } from 'lucide-react'
import type { ChoreWithInstance } from '../../types/app.types'
import { StatusBadge } from './StatusBadge'

interface ChoreCardProps {
  item: ChoreWithInstance
  onMarkDone?: (choreId: string, instanceId: string | null) => void
  onUndo?: (instanceId: string) => void
  isChild?: boolean
  upcoming?: boolean
}

const statusIcons = {
  pending: <Circle size={20} className="text-gray-400" />,
  pending_approval: <Clock size={20} className="text-amber-500" />,
  approved: <CheckCircle2 size={20} className="text-emerald-500" />,
  rejected: <XCircle size={20} className="text-red-500" />,
}

export function ChoreCard({ item, onMarkDone, onUndo, isChild, upcoming }: ChoreCardProps) {
  const status = item.instance?.status ?? 'pending'
  const canMarkDone = isChild && !upcoming && (status === 'pending' || status === 'rejected')
  const canUndo = isChild && status === 'pending_approval' && !!item.instance?.id

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
      status === 'approved'
        ? 'border-emerald-200 bg-emerald-50'
        : status === 'pending_approval'
        ? 'border-amber-200 bg-amber-50'
        : status === 'rejected'
        ? 'border-red-200 bg-red-50'
        : upcoming
        ? 'border-gray-100 bg-gray-50 opacity-60'
        : 'border-gray-200 bg-white'
    }`}>
      {/* Status icon */}
      <div className="shrink-0">
        {statusIcons[status]}
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium leading-tight ${status === 'approved' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{item.description}</p>
        )}
        {item.instance?.rejection_note && (
          <p className="mt-1 text-xs text-red-600">Note: {item.instance.rejection_note}</p>
        )}
      </div>

      {/* Right side: badge or action */}
      <div className="shrink-0 flex items-center gap-2">
        {upcoming ? (
          <span className="text-xs text-gray-400">Upcoming</span>
        ) : canMarkDone ? (
          <button
            onClick={() => onMarkDone?.(item.id, item.instance?.id ?? null)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95 transition-transform"
          >
            Mark done
          </button>
        ) : canUndo ? (
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <button
              onClick={() => onUndo?.(item.instance!.id)}
              className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100 active:scale-95 transition-transform"
              title="Undo"
              aria-label="Undo mark done"
            >
              <Undo2 size={16} />
            </button>
          </div>
        ) : (
          <StatusBadge status={status} />
        )}
      </div>
    </div>
  )
}
