import { createFileRoute } from '@tanstack/react-router'
import InstitutionProtectedRoutes from '@/utils/InstitutionProtectedRoutes'
import { useEffect, useMemo, useState } from 'react'
import {
  createInstitutionNotice,
  deleteInstitutionNotice,
  getInstitutionNoticeFeed,
  getMyInstitutionNotices,
  updateInstitutionNotice,
} from '@/api/notice'
import type { Notice } from '@/types/notice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/institution/notices')({
  component: () => (
    <InstitutionProtectedRoutes>
      <InstitutionNotices />
    </InstitutionProtectedRoutes>
  ),
})

function InstitutionNotices() {
  const [feed, setFeed] = useState<Notice[]>([])
  const [own, setOwn] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const canSubmit = useMemo(() => title.trim().length >= 3 && content.trim().length >= 10, [title, content])
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [f, o] = await Promise.all([
        getInstitutionNoticeFeed(),
        getMyInstitutionNotices(),
      ])
      setFeed(f)
      setOwn(o)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!canSubmit) return
    await createInstitutionNotice({ title: title.trim(), content: content.trim() })
    setTitle(''); setContent('')
    await load()
  }

  const onDelete = async (id: string) => {
    await deleteInstitutionNotice(id)
    await load()
  }

  const openEdit = (n: Notice) => {
    setEditing(n)
    setEditTitle(n.title)
    setEditContent(n.content)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateInstitutionNotice(editing.noticeId, { title: editTitle.trim(), content: editContent.trim() })
      setEditOpen(false)
      setEditing(null)
      await load()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Institution Notices</h1>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Publish Academic Notice</CardTitle>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Audience:</span>
            <Badge>STUDENT</Badge>
            <span>&</span>
            <Badge>SYSTEM ADMIN</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam schedule, result publication, etc." />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Write the notice content in proper academic style..." />
            </div>
            <div>
              <Button onClick={submit} disabled={!canSubmit} className="bg-gray-900 hover:bg-gray-800">Publish</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Notice Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : feed.length === 0 ? (
              <div className="text-gray-600">No notices.</div>
            ) : (
              <div className="space-y-3">
                {feed.map((n) => (
                  <div key={n.noticeId} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        <Link to="/institution/notices/$id" params={{ id: n.noticeId }} className="hover:underline">{n.title}</Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{n.category}</Badge>
                        <Badge>{n.audience}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
                    <div className="mt-2 text-gray-800 whitespace-pre-wrap">{n.content}</div>
                    <div className="mt-2 text-xs text-gray-500">Issued by: {n.institutionId ? 'Your Institution' : 'System Admin'}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Manage My Notices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {own.map((n) => (
                    <TableRow key={n.noticeId}>
                      <TableCell className="font-medium">
                        <Link to="/institution/notices/$id" params={{ id: n.noticeId }} className="hover:underline">{n.title}</Link>
                      </TableCell>
                      <TableCell>{n.published ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(n)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(n.noticeId)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>Update the title and content, then save your changes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea id="edit-content" rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving || editTitle.trim().length < 3 || editContent.trim().length < 10}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
