import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Pocket Money</h1>
          <p className="mt-1 text-gray-500 text-sm">Sign in to see your chores</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
