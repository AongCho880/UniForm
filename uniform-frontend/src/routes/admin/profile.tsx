// uniform-frontend/src/routes/admin/profile.tsx

import AdminProtectedRoutes from '@/utils/AdminProtectedRoutes'
import { ROLES } from '@/utils/role'
import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin/adminApi'
import type { SystemAdmin } from '@/types/admin'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/profile')({
  component: () => (
    <AdminProtectedRoutes role={ROLES.ADMIN}>
      <RouteComponent />
    </AdminProtectedRoutes>
  ),
})

function RouteComponent() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<SystemAdmin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.getProfile()
        setProfile(data)
      } catch (e) {
        toast.error('Failed to load profile')
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigate({ to: '/admin/dashboard' })
        break
      case 'institutions':
        navigate({ to: '/admin/institutions' })
        break
      case 'admins':
        navigate({ to: '/admin/admins' })
        break
      case 'visualization':
        navigate({ to: '/admin/visualization' })
        break
      default:
        navigate({ to: '/admin/dashboard' })
    }
  }

  return (
    <AdminLayout activeTab={'profile'} onTabChange={onTabChange}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-600">Loading profile...</div>
          ) : !profile ? (
            <div className="py-8 text-center text-gray-600">Failed to load profile</div>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                  {profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-gray-900 font-medium">{profile.email}</div>
                  <div className="text-gray-600 text-sm">System Administrator</div>
                </div>
                <Badge variant="outline" className="ml-auto">{profile.role}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-gray-500">User ID</div>
                  <div className="text-gray-900">{profile.systemAdminId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Created</div>
                  <div className="text-gray-900">{new Date(profile.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Updated</div>
                  <div className="text-gray-900">{new Date(profile.updatedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Last Login</div>
                  <div className="text-gray-900">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '�'}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}





