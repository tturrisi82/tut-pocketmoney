import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Clock3, History, LogOut } from 'lucide-react'
import { signOut } from '../../hooks/useAuth'

const navItems = [
  { to: '/child/today', icon: <Clock3 size={22} />, label: 'Today' },
  { to: '/child/week', icon: <CalendarDays size={22} />, label: 'This Week' },
  { to: '/child/history', icon: <History size={22} />, label: 'History' },
]

export function ChildLayout() {
  return (
    <div className="flex flex-col min-h-svh bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span className="text-base font-semibold text-gray-900">My Chores</span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex safe-area-bottom">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
