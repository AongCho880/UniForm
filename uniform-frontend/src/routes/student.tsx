import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import ProtectedRoutes from '@/utils/ProtectedRoutes'
import { ROLES } from '@/utils/role'
import Header from '@/components/student/Header'
import { useEffect, useMemo, useState } from 'react'
import { getUserProfile } from '@/api'
import type { UserData } from '@/components/student/types'

export const Route = createFileRoute('/student')({
  component: () => (
    <ProtectedRoutes role={ROLES.STUDENT}>
      <RouteComponent />
    </ProtectedRoutes>
  ),
})

function RouteComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile()
        if (profile) setUserData(profile)
      } catch {
        // non-blocking for header only
      }
    })()
  }, [])

  const activeSection = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/student/academic-info')) return 'academic-info'
    if (p.startsWith('/student/applications')) return 'applications'
    if (p.startsWith('/student/notices')) return 'notifications'
    if (p.startsWith('/student/universities') || p.startsWith('/student/institutions')) return 'universities'
    if (p.startsWith('/student/settings')) return 'settings'
    return 'dashboard'
  }, [location.pathname])

  const setActiveSection = (section: string) => {
    const map: Record<string, string> = {
      dashboard: '/student/dashboard',
      universities: '/student/institutions',
      'academic-info': '/student/academic-info',
      applications: '/student/applications',
      notifications: '/student/notices',
      settings: '/student/settings',
    }
    navigate({ to: map[section] || '/student/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userData && (
        <Header userData={userData} activeSection={activeSection} setActiveSection={setActiveSection} />
      )}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default RouteComponent
