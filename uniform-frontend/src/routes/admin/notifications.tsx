import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AdminProtectedRoutes from '@/utils/AdminProtectedRoutes'
import { ROLES } from '@/utils/role'
import { useEffect, useState } from 'react'
import { getSystemNoticeFeed } from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const Route = createFileRoute('/admin/notifications')({
  component: () => (
    <AdminProtectedRoutes role={ROLES.ADMIN}>
      <RouteComponent />
    </AdminProtectedRoutes>
  ),
})

function RouteComponent() {
  const navigate = useNavigate()
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
      case 'notices':
        navigate({ to: '/admin/notices' })
        break
      case 'visualization':
        navigate({ to: '/admin/visualization' })
        break
      default:
        navigate({ to: '/admin/dashboard' })
    }
  }
  return (
    <AdminLayout activeTab={'notices'} onTabChange={onTabChange}>
      <SystemAdminNotifications />
    </AdminLayout>
  )
}

function SystemAdminNotifications() {
  const [items, setItems] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getSystemNoticeFeed()
        setItems(data)
      } finally { setLoading(false) }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-lg">Recent Institution Notices</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-600">No notifications.</div>
          ) : (
            <div className="space-y-3">
              {items.map((n) => (
                <div key={n.noticeId} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">
                      <Link to="/admin/notices/$id" params={{ id: n.noticeId }} className="hover:underline">{n.title}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{n.category}</Badge>
                      <Badge>{n.audience}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
                  <div className="mt-2 text-gray-800 whitespace-pre-wrap">{n.content}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
