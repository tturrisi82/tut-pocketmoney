import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateNavigatorProps {
  label: string
  onPrev: () => void
  onNext: () => void
  disableNext?: boolean
}

export function DateNavigator({ label, onPrev, onNext, disableNext }: DateNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-36 text-center text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
