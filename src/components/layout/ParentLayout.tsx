import { NavLink, Outlet } from 'react-router-dom'
import { ListChecks, ClipboardCheck, History, LogOut, BellDot, BarChart2, Settings } from 'lucide-react'
import { signOut } from '../../hooks/useAuth'
import { usePendingCount } from '../../hooks/usePendingApprovals'

const navItems = [
  { to: '/parent/chores', icon: <ListChecks size={18} />, label: 'Manage Chores' },
  { to: '/parent/review', icon: <ClipboardCheck size={18} />, label: 'Review', showBadge: true },
  { to: '/parent/progress', icon: <BarChart2 size={18} />, label: 'Progress' },
  { to: '/parent/history', icon: <History size={18} />, label: 'History' },
  { to: '/parent/settings', icon: <Settings size={18} />, label: 'Settings' },
]

export function ParentLayout() {
  const pendingCount = usePendingCount()

  return (
    <div className="flex min-h-svh">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-sm font-semibold text-gray-900">Pocket Money</span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">Parent dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon, label, showBadge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {icon}
              <span className="flex-1">{label}</span>
              {showBadge && pendingCount > 0 && (
                <span className="flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold h-5 min-w-5 px-1">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-sm font-semibold text-gray-900">Pocket Money</span>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <NavLink to="/parent/review" className="relative">
                <BellDot size={22} className="text-red-500" />
              </NavLink>
            )}
            <button onClick={() => signOut()} className="text-gray-500 hover:text-gray-700">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-10">
          {navItems.map(({ to, icon, label, showBadge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium relative ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`
              }
            >
              {icon}
              {label}
              {showBadge && pendingCount > 0 && (
                <span className="absolute top-2 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
