import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import AdminProtectedRoutes from '@/utils/AdminProtectedRoutes'
import { ROLES } from '@/utils/role'
import { useEffect, useState } from 'react'
import { getSystemNoticeById } from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const Route = createFileRoute('/admin/notices/$id')({
  component: () => (
    <AdminProtectedRoutes role={ROLES.ADMIN}>
      <RouteComponent />
    </AdminProtectedRoutes>
  ),
})

function RouteComponent() {
  const navigate = useNavigate()
  const params = useParams({ from: '/admin/notices/$id' })
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const n = await getSystemNoticeById(params.id)
        setNotice(n)
      } finally { setLoading(false) }
    })()
  }, [params.id])

  const onTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard': navigate({ to: '/admin/dashboard' }); break
      case 'institutions': navigate({ to: '/admin/institutions' }); break
      case 'admins': navigate({ to: '/admin/admins' }); break
      case 'notices': navigate({ to: '/admin/notices' }); break
      case 'visualization': navigate({ to: '/admin/visualization' }); break
      default: navigate({ to: '/admin/dashboard' })
    }
  }

  return (
    <AdminLayout activeTab={'notices'} onTabChange={onTabChange}>
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate({ to: '/admin/notices' })}>Back to Notices</Button>
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900">{loading ? 'Loading...' : notice?.title || 'Not found'}</CardTitle>
              {notice && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{notice.category}</Badge>
                  <Badge>{notice.audience}</Badge>
                </div>
              )}
            </div>
            {notice && (
              <div className="text-xs text-gray-500">{notice.publishedAt ? new Date(notice.publishedAt).toLocaleString() : ''} • Issued by: {notice.institutionId ? 'Institution' : 'System Admin'}</div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : !notice ? (
              <div className="text-gray-600">Notice not found.</div>
            ) : (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{notice.content}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

