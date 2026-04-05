import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns'

/** Returns today's date string in YYYY-MM-DD, using local time (not UTC). */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Returns a date string in YYYY-MM-DD for a given Date object (local time). */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Parses a YYYY-MM-DD string into a Date at midnight local time. */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Returns the Mon–Sun range (as date strings) for the week containing `date`. */
export function getWeekRange(date: Date): { start: string; end: string; days: string[] } {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 })   // Sunday
  const days = eachDayOfInterval({ start, end }).map(toDateString)
  return { start: toDateString(start), end: toDateString(end), days }
}

/** Day-of-week number (0=Sun, 1=Mon, ..., 6=Sat) for a date string. */
export function getDayOfWeek(dateStr: string): number {
  return parseDateString(dateStr).getDay()
}

/** Human-readable label: "Today", "Yesterday", or "Mon Apr 7". */
export function formatDayLabel(dateStr: string): string {
  const today = getTodayString()
  const yesterday = toDateString(subDays(new Date(), 1))
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return format(parseDateString(dateStr), 'EEE MMM d')
}

/** Full date label: "Monday, April 7" */
export function formatFullDate(dateStr: string): string {
  return format(parseDateString(dateStr), 'EEEE, MMMM d')
}

/** Short weekday name: "Mon", "Tue", etc. */
export function shortWeekday(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayOfWeek] ?? ''
}

export { addDays, subDays }
