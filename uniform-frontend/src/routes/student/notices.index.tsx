import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getStudentNoticeFeed } from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/student/notices/')({
  component: () => <StudentNoticeBoard />,
})

function StudentNoticeBoard() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudentNoticeFeed()
        setNotices(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
      {loading ? (
        <div className="text-gray-600">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-gray-600">No notices available.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notices.map((n) => (
            <Card
              key={n.noticeId}
              className="border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate({ to: '/student/notices/$id', params: { id: n.noticeId } })}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900">
                    {n.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{n.category}</Badge>
                    <Badge>{n.audience}</Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{n.content}</div>
                <div className="mt-4 text-xs text-gray-500">Issued by: {n.institutionId ? 'Institution' : 'System Admin'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Route

