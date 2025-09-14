import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AdminProtectedRoutes from '@/utils/AdminProtectedRoutes'
import { ROLES } from '@/utils/role'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@tanstack/react-router'
import { Textarea } from '@/components/ui/textarea'
import {
  createSystemNotice,
  deleteSystemNotice,
  listSystemNotices,
  updateSystemNotice,
} from '@/api/notice'
import type { Notice, NoticeAudience, NoticeCategory } from '@/types/notice'
import { AdminLayout } from '@/components/admin/AdminLayout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/notices')({
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
      <AdminNotices />
    </AdminLayout>
  )
}

function AdminNotices() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<NoticeAudience>('BOTH')
  const [category, setCategory] = useState<NoticeCategory>('GENERAL')
  const [items, setItems] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = useMemo(() => title.trim().length >= 3 && content.trim().length >= 10, [title, content])

  const load = async () => {
    setLoading(true)
    try {
      const data = await listSystemNotices()
      setItems(data)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!canSubmit) return
    await createSystemNotice({ title: title.trim(), content: content.trim(), audience, category })
    setTitle(''); setContent('')
    await load()
  }

  const onDelete = async (id: string) => {
    await deleteSystemNotice(id)
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
      await updateSystemNotice(editing.noticeId, { title: editTitle.trim(), content: editContent.trim() })
      setEditOpen(false)
      setEditing(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">System Notices</h1>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Publish Notice</CardTitle>
          <div className="text-sm text-gray-600">Choose audience: Institution, Student, or Both.</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className='mb-2'>Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Admission circular, holiday notice, etc." />
            </div>
            <div>
              <Label className='mb-2'>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as NoticeAudience)}>
                <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="INSTITUTION">Institution</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className='mb-2'>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as NoticeCategory)}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="content" className='mb-2'>Content</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Compose the notice in proper academic style..." />
            </div>
            <div className="md:col-span-2">
              <Button onClick={submit} disabled={!canSubmit} className="bg-gray-900 hover:bg-gray-800">Publish</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Manage Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((n) => (
                  <TableRow key={n.noticeId}>
                    <TableCell className="font-medium">
                      <Link to="/admin/notices/$id" params={{ id: n.noticeId }} className="hover:underline">{n.title}</Link>
                    </TableCell>
                    <TableCell><Badge>{n.audience}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{n.category}</Badge></TableCell>
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
