import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar, Header, ToastContainer } from '@/shared/components'
import { useRequireAuth } from '@/hooks/useAuth'
import { useRealtimeSocket } from '@/hooks/useRealtime'

export function MainLayout() {
  const { isAuthenticated } = useRequireAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useRealtimeSocket()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-bg-page text-text-primary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
