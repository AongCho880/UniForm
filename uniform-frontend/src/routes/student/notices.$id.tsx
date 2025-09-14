import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import ProtectedRoutes from '@/utils/ProtectedRoutes'
import { ROLES } from '@/utils/role'
import { useEffect, useState } from 'react'
import { getStudentNoticeById } from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/student/notices/$id')({
  component: () => (
    <ProtectedRoutes role={ROLES.STUDENT}>
      <RouteComponent />
    </ProtectedRoutes>
  ),
})

function RouteComponent() {
  const params = useParams({ from: '/student/notices/$id' })
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const n = await getStudentNoticeById(params.id)
        setNotice(n)
      } finally { setLoading(false) }
    })()
  }, [params.id])

  return (
    <div className="space-y-4">
      <Link to="/student/notices"><Button variant="outline">Back to Notices</Button></Link>
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
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{notice.content}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

