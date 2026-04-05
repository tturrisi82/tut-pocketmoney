import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { LoginPage } from './pages/LoginPage'
import { ChildLayout } from './components/layout/ChildLayout'
import { ParentLayout } from './components/layout/ParentLayout'
import { ChildTodayPage } from './pages/child/ChildTodayPage'
import { ChildWeekPage } from './pages/child/ChildWeekPage'
import { ChildHistoryPage } from './pages/child/ChildHistoryPage'
import { ParentChoresPage } from './pages/parent/ParentChoresPage'
import { ParentReviewPage } from './pages/parent/ParentReviewPage'
import { ParentHistoryPage } from './pages/parent/ParentHistoryPage'
import { WeekProgressPage } from './pages/WeekProgressPage'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) { navigate('/login', { replace: true }); return }
    if (profile?.role === 'child') { navigate('/child/today', { replace: true }); return }
    if (profile?.role === 'parent') { navigate('/parent/chores', { replace: true }); return }
  }, [user, profile, loading, navigate])

  return <LoadingSpinner label="Loading your chores…" />
}

function RequireAuth({ role, children }: { role: 'parent' | 'child'; children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner label="Loading…" />
  if (!user) return <Navigate to="/login" replace />
  if (profile && profile.role !== role) {
    return <Navigate to={profile.role === 'child' ? '/child/today' : '/parent/chores'} replace />
  }
  return <>{children}</>
}

export default function App() {
  const { profile } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Child routes */}
      <Route
        path="/child"
        element={
          <RequireAuth role="child">
            <ChildLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="today" replace />} />
        <Route path="today" element={<ChildTodayPage />} />
        <Route path="week" element={<ChildWeekPage />} />
        <Route path="progress" element={<WeekProgressPage />} />
        <Route path="history" element={<ChildHistoryPage />} />
      </Route>

      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <RequireAuth role="parent">
            <ParentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="chores" replace />} />
        <Route
          path="chores"
          element={profile?.id ? <ParentChoresPage userId={profile.id} /> : <LoadingSpinner />}
        />
        <Route
          path="review"
          element={profile?.id ? <ParentReviewPage reviewerId={profile.id} /> : <LoadingSpinner />}
        />
        <Route path="progress" element={<WeekProgressPage />} />
        <Route path="history" element={<ParentHistoryPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
