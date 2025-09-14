import { createFileRoute } from '@tanstack/react-router'
import InstitutionProtectedRoutes from '@/utils/InstitutionProtectedRoutes'
import { useEffect, useState } from 'react'
import { getInstitutionNoticeFeed } from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/institution/notifications')({
  component: () => (
    <InstitutionProtectedRoutes>
      <InstitutionNotifications />
    </InstitutionProtectedRoutes>
  ),
})

function InstitutionNotifications() {
  const [items, setItems] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getInstitutionNoticeFeed()
        setItems(data)
      } finally { setLoading(false) }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-lg">Recent Notices</CardTitle></CardHeader>
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
                    <div className="font-semibold text-gray-900">{n.title}</div>
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

