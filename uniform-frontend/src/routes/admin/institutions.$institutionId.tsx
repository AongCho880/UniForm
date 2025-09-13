// uniform-frontend/src/routes/admin/institutions.$institutionId.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '@/api/admin/adminApi'
import type { Institution } from '@/types/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Phone as PhoneIcon, Mail, Globe, CalendarDays, Tag as TagIcon } from 'lucide-react'
import { toast } from 'sonner'

// Local categories list (kept in sync with CreateInstitutionDialog)
const INSTITUTION_CATEGORIES = ['University', 'College', 'Science and Technology University']

const OWNERSHIP_OPTIONS = ['PUBLIC', 'PRIVATE'] as const
const INSTITUTION_TYPE_OPTIONS = ['GENERAL', 'ENGINEERING'] as const

export const Route = createFileRoute('/admin/institutions/$institutionId')({
  component: () => <RouteComponent />,
})

function RouteComponent() {
  const navigate = useNavigate()
  const params = Route.useParams() as { institutionId: string }
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  // Edit form state
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    categoryName: '',
    ownership: '',
    type: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    establishedYear: '',
    logoUrl: '',
  })

  // Compute a normalized category name for backend payload based on ownership
  const computeCategoryNameForPayload = (categoryName?: string, ownership?: string) => {
    const trimmed = (categoryName || '').trim()
    if (!trimmed) return undefined
    const lc = trimmed.toLowerCase()
    if (lc.includes('science') && lc.includes('technology') && ownership) {
      const own = String(ownership).toUpperCase() === 'PUBLIC' ? 'Public' : 'Private'
      return `${own} Science and Technology University`
    }
    return trimmed
  }

  // Helpers to map legacy combined categories to separate fields
  const normalizeCategory = (name: string): string => {
    const lc = name.toLowerCase()
    if (lc.includes('college')) return 'College'
    if (lc.includes('university')) return 'University'
    return name || ''
  }

  const deriveTypeFromCategory = (name: string): '' | 'GENERAL' | 'ENGINEERING' => {
    const lc = name.toLowerCase()
    if (lc.includes('engineering')) return 'ENGINEERING'
    // Treat Science & Technology as GENERAL type in our schema
    if (lc.includes('science') && lc.includes('technology')) return 'GENERAL'
    if (lc.includes('general') || lc.includes('national') || lc.includes('college')) return 'GENERAL'
    return ''
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getInstitutionById(params.institutionId)
        setInstitution(data)
        const rawCategory = data.InstitutionCategory?.name ?? ''
        const normalizedCategory = normalizeCategory(rawCategory)
        const initialType = (data.type as 'GENERAL' | 'ENGINEERING' | null) ?? deriveTypeFromCategory(rawCategory)
        const lc = rawCategory.toLowerCase()
        const inferredOwnership = lc.includes('public')
          ? 'PUBLIC'
          : lc.includes('private')
            ? 'PRIVATE'
            : lc.includes('national')
              ? 'PUBLIC'
              : ''
        const initialOwnership = (data.ownership as 'PUBLIC' | 'PRIVATE' | null) ?? (inferredOwnership as '' | 'PUBLIC' | 'PRIVATE')

        setForm({
          name: data.name ?? '',
          shortName: data.shortName ?? '',
          categoryName: normalizedCategory,
          ownership: initialOwnership || '',
          type: initialType || '',
          description: data.description ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          website: data.website ?? '',
          establishedYear: data.establishedYear?.toString() ?? '',
          logoUrl: data.logoUrl ?? '',
        })
      } catch (e) {
        toast.error('Failed to load institution')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.institutionId])

  const handleStartEdit = () => setIsEditing(true)
  const handleCancelEdit = () => {
    if (institution) {
      const rawCategory = institution.InstitutionCategory?.name ?? ''
      setForm({
        name: institution.name ?? '',
        shortName: institution.shortName ?? '',
        categoryName: normalizeCategory(rawCategory),
        ownership: ((): '' | 'PUBLIC' | 'PRIVATE' => {
          const lc = rawCategory.toLowerCase()
          const inferred = lc.includes('public') ? 'PUBLIC' : (lc.includes('private') ? 'PRIVATE' : (lc.includes('national') ? 'PUBLIC' : ''))
          return (institution.ownership as 'PUBLIC' | 'PRIVATE' | null) ?? inferred
        })(),
        type: (institution.type as 'GENERAL' | 'ENGINEERING' | null) ?? deriveTypeFromCategory(rawCategory),
        description: institution.description ?? '',
        address: institution.address ?? '',
        phone: institution.phone ?? '',
        email: institution.email ?? '',
        website: institution.website ?? '',
        establishedYear: institution.establishedYear?.toString() ?? '',
        logoUrl: institution.logoUrl ?? '',
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        shortName: form.shortName?.trim() || undefined,
        categoryName: computeCategoryNameForPayload(form.categoryName, form.ownership) || undefined,
        ownership: (form.ownership as 'PUBLIC' | 'PRIVATE') || undefined,
        type: (form.type as 'GENERAL' | 'ENGINEERING') || undefined,
        description: form.description?.trim() || undefined,
        address: form.address?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        website: form.website?.trim() || undefined,
        establishedYear:
          form.establishedYear && !Number.isNaN(Number(form.establishedYear))
            ? Number(form.establishedYear)
            : undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
      }
      const updated = await adminApi.updateInstitution(params.institutionId, payload)
      setInstitution(updated)
      setIsEditing(false)
      toast.success('Institution updated')
    } catch (e: unknown) {
      const resp = (e as Record<string, unknown>)?.['response'] as
        | Record<string, unknown>
        | undefined
      const data = resp?.['data'] as Record<string, unknown> | undefined
      const errors = data?.['errors'] as Array<Record<string, unknown>> | undefined
      const firstMessage = errors?.[0]?.['message'] as string | undefined

      if (firstMessage) {
        toast.error(firstMessage || 'Validation failed')
      } else {
        toast.error('Failed to update institution')
      }
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const display = (val?: string | number | null) => {
    if (val === undefined || val === null || String(val).trim() === '') return '—'
    return String(val)
  }

  // Ensure current category remains selectable even if not in the static list
  const availableCategories = useMemo(() => {
    const list = [...INSTITUTION_CATEGORIES]
    const current = (form.categoryName || '').trim()
    if (current && !list.includes(current)) {
      return [current, ...list]
    }
    return list
  }, [form.categoryName])

const getCategoryBadgeColor = (categoryName: string) => {
  void categoryName
  return 'bg-gray-100 text-gray-800'
}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Institution</h1>
          <p className="text-gray-500">Overview and settings</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => navigate({ to: '/admin/institutions' })}>
                Back to list
              </Button>
              <Button onClick={handleStartEdit}>Edit</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 p-1 border-1 aspect-square rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {institution?.logoUrl ? (
                <img
                  src={institution.logoUrl}
                  alt={institution?.name ? `${institution.name} logo` : 'Institution logo'}
                  className="block h-[95%] object-cover rounded-full"
                />
              ) : (
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {institution?.name || 'Loading...'}
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>ID: {params.institutionId.substring(0, 8)}</span>
                {institution?.createdAt && (
                  <span>• Created {new Date(institution.createdAt).toLocaleDateString()}</span>
                )}
                {institution?.updatedAt && (
                  <span>• Updated {new Date(institution.updatedAt).toLocaleDateString()}</span>
                )}
                {(!isEditing && institution?.InstitutionCategory?.name) && (
                  <Badge className={getCategoryBadgeColor(institution.InstitutionCategory.name)}>
                    {institution.InstitutionCategory.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading institution...</div>
          ) : (
            <div className="grid gap-8 max-w-4xl">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Name</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      {display(institution?.name)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Short Name</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {display(institution?.shortName ?? undefined)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Category</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {institution?.InstitutionCategory?.name ? (
                        <Badge className={getCategoryBadgeColor(institution.InstitutionCategory.name)}>
                          {institution.InstitutionCategory.name}
                        </Badge>
                      ) : (
                        'Uncategorized'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Ownership</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {institution?.ownership ? (
                        <Badge className="bg-gray-300 text-gray-900">
                          {institution.ownership.charAt(0) + institution.ownership.slice(1).toLowerCase()}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Type</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {institution?.type ? (
                        <Badge className="bg-gray-200 text-gray-800">
                          {institution.type.charAt(0) + institution.type.slice(1).toLowerCase()}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs uppercase text-gray-500">Description</div>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {display(institution?.description)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Address</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {display(institution?.address)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Phone</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      {institution?.phone ? (
                        <a className="text-gray-700 hover:underline" href={`tel:${institution.phone}`}>{institution.phone}</a>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Email</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {institution?.email ? (
                        <a className="text-gray-700 hover:underline" href={`mailto:${institution.email}`}>{institution.email}</a>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Website</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      {institution?.website ? (
                        <a className="text-gray-700 hover:underline" href={institution.website} target="_blank" rel="noreferrer">
                          {institution.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Established</div>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      {display(institution?.establishedYear ?? undefined)}
                    </div>
                  </div>
                  {/* Logo URL hidden in view mode by request */}
                </div>
              ) : (
                <div className="grid gap-4">
                  {/* Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  {/* Short Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shortName" className="text-right">Short Name</Label>
                    <Input
                      id="shortName"
                      className="col-span-3"
                      maxLength={20}
                      value={form.shortName}
                      onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                    />
                  </div>
                  {/* Category */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select
                      value={form.categoryName}
                      onValueChange={(v) => setForm((f) => ({ ...f, categoryName: v }))}
                    >
                      <SelectTrigger id="category" className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Ownership */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ownership" className="text-right">Ownership</Label>
                    <Select
                      value={form.ownership}
                      onValueChange={(v) => setForm((f) => ({ ...f, ownership: v }))}
                    >
                      <SelectTrigger id="ownership" className="col-span-3">
                        <SelectValue placeholder="Select ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNERSHIP_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Type */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                    >
                      <SelectTrigger id="type" className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTION_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Description */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right mt-2">Description</Label>
                    <Textarea
                      id="description"
                      className="col-span-3"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  {/* Address */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Address</Label>
                    <Input
                      id="address"
                      className="col-span-3"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    />
                  </div>
                  {/* Phone */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input
                      id="phone"
                      className="col-span-3"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  {/* Email */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="col-span-3"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  {/* Website */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      className="col-span-3"
                      value={form.website}
                      onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    />
                  </div>
                  {/* Established */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="established" className="text-right">Established</Label>
                    <Input
                      id="established"
                      type="number"
                      className="col-span-3"
                      min={1800}
                      max={currentYear}
                      value={form.establishedYear}
                      onChange={(e) => setForm((f) => ({ ...f, establishedYear: e.target.value }))}
                    />
                  </div>
                  {/* Logo URL */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="logo" className="text-right">Logo URL</Label>
                    <Input
                      id="logo"
                      type="url"
                      className="col-span-3"
                      value={form.logoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
