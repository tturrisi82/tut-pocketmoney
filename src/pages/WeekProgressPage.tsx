import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Minus } from 'lucide-react'
import { useWeekProgress, type DayProgress } from '../hooks/useWeekProgress'
import { useSettings } from '../hooks/useSettings'
import { getWeekRange, formatDayLabel, getTodayString, addDays, subDays } from '../lib/dates'
import { DateNavigator } from '../components/ui/DateNavigator'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeekProgressPage() {
  const today = getTodayString()
  const [weekAnchor, setWeekAnchor] = useState(new Date())
  const { start, end, days } = getWeekRange(weekAnchor)
  const isCurrentWeek = today >= start && today <= end

  const { data, isLoading } = useWeekProgress(days)
  const { data: settings } = useSettings()
  const weeklyTarget = settings?.weekly_target ?? 10

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto space-y-5">
      {/* Header + week navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Weekly Progress</h1>
        <DateNavigator
          label={isCurrentWeek ? 'This week' : formatDayLabel(start).split(',')[0] + '…'}
          onPrev={() => setWeekAnchor((d) => subDays(d, 7))}
          onNext={() => setWeekAnchor((d) => addDays(d, 7))}
          disableNext={isCurrentWeek}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {data && (
        <>
          {/* Overall score card */}
          <OverallScore data={data} weeklyTarget={weeklyTarget} />

          {/* Day-by-day breakdown */}
          <div className="space-y-2">
            {data.days.map((day) => (
              <DayRow key={day.dateStr} day={day} today={today} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OverallScore({ data, weeklyTarget }: { data: NonNullable<ReturnType<typeof useWeekProgress>['data']>; weeklyTarget: number }) {
  const { totalApproved, totalChores, completedDays, scorableDays } = data
  const pct = totalChores > 0 ? totalApproved / totalChores : 0
  const pctDisplay = Math.round(pct * 100)
  const earned = (pct * weeklyTarget).toFixed(2)
  const allDone = scorableDays > 0 && completedDays === scorableDays

  return (
    <div className={`rounded-2xl p-5 ${allDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Chores approved</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalApproved}
            <span className="text-lg font-normal text-gray-400">/{totalChores}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{pctDisplay}% this week</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Earned so far</p>
          <p className={`text-3xl font-bold mt-1 ${allDone ? 'text-emerald-600' : 'text-indigo-600'}`}>
            £{earned}
          </p>
          <p className="text-sm text-gray-400 mt-1">of £{weeklyTarget.toFixed(2)}</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalChores > 0 && (
        <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${allDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${pctDisplay}%` }}
          />
        </div>
      )}

      {allDone && scorableDays > 0 ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          All chores done — £{weeklyTarget.toFixed(2)} pocket money earned! 🎉
        </p>
      ) : totalChores > 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          Complete all chores to earn the full £{weeklyTarget.toFixed(2)}
        </p>
      ) : null}
    </div>
  )
}

function DayRow({ day, today }: { day: DayProgress; today: string }) {
  const isFuture = day.dateStr > today
  const isToday = day.dateStr === today

  // Determine row state
  const icon = (() => {
    if (day.total === 0) return <Minus size={20} className="text-gray-300" />
    if (isFuture) return <Minus size={20} className="text-gray-300" />
    if (day.isComplete) return <CheckCircle2 size={20} className="text-emerald-500" />
    if (day.pendingApproval > 0 && day.approved + day.pendingApproval === day.total)
      return <Clock size={20} className="text-amber-500" />
    return <XCircle size={20} className="text-red-400" />
  })()

  const bgClass = (() => {
    if (day.total === 0 || isFuture) return 'bg-gray-50 border-gray-100'
    if (day.isComplete) return 'bg-emerald-50 border-emerald-200'
    if (isToday) return 'bg-indigo-50 border-indigo-200'
    return 'bg-red-50 border-red-200'
  })()

  const dow = new Date(day.dateStr + 'T12:00:00').getDay()

  return (
    <div className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${bgClass}`}>
      {/* Day name */}
      <div className="w-10 shrink-0">
        <p className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-gray-600'}`}>
          {DAY_NAMES[dow]}
        </p>
        {isToday && <p className="text-xs text-indigo-500">Today</p>}
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        {day.total === 0 || isFuture ? (
          <p className="text-xs text-gray-400">{isFuture ? 'Upcoming' : 'No chores'}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                {day.approved}/{day.total} approved
              </span>
              {day.pendingApproval > 0 && (
                <span className="text-xs text-amber-600">{day.pendingApproval} awaiting</span>
              )}
              {day.rejected > 0 && (
                <span className="text-xs text-red-500">{day.rejected} rejected</span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${day.isComplete ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                style={{ width: `${day.total > 0 ? (day.approved / day.total) * 100 : 0}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Status icon */}
      <div className="shrink-0">{icon}</div>
    </div>
  )
}
