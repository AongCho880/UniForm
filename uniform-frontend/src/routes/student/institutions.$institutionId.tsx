import ProtectedRoutes from '@/utils/ProtectedRoutes'
import { ROLES } from '@/utils/role'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getEligibleInstitutionById, type EligibleInstitution, type EligibleUnit } from '@/api/studentExplore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { applyToUnit, listMyApplications, type MyApplication } from '@/api/studentApplications'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getUserProfile, getAcademicDetails } from '@/api'
import type { User } from '@/context/student/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Header is rendered by parent /student layout

export const Route = createFileRoute('/student/institutions/$institutionId')({
  component: () => (
    <ProtectedRoutes role={ROLES.STUDENT}>
      <RouteComponent />
    </ProtectedRoutes>
  ),
})

function RouteComponent() {
  const { institutionId } = useParams({ from: '/student/institutions/$institutionId' })
  const navigate = useNavigate()
  const [inst, setInst] = useState<EligibleInstitution | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [missingOpen, setMissingOpen] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  // Center selection modal
  const [centerOpen, setCenterOpen] = useState(false)
  const [center, setCenter] = useState<string>('Dhaka')
  const [pendingUnit, setPendingUnit] = useState<EligibleUnit | null>(null)
  const [appliedUnits, setAppliedUnits] = useState<Set<string>>(new Set())

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const data = await getEligibleInstitutionById(institutionId)
        setInst(data)
        try {
          const [p, a, apps] = await Promise.all([getUserProfile(), getAcademicDetails(), listMyApplications()])
          const merged: User | null = p && a ? { ...p, ...a } : (p || a)
          setProfile(merged)
          const ids = new Set<string>()
            ; (apps || []).forEach((app: MyApplication) => { if (app.unitId) ids.add(app.unitId) })
          setAppliedUnits(ids)
        } catch { /* ignore */ }
      } finally { setLoading(false) }
    })()
  }, [institutionId])

  const getRequiredMissing = (p: User | null): string[] => {
    const missing: string[] = []
    const has = (v: unknown): boolean => {
      if (v === null || v === undefined) return false
      if (typeof v === 'string') return v.trim().length > 0
      if (typeof v === 'number') return !Number.isNaN(v)
      return !!v
    }
    if (!p) return ['Profile information not loaded']
    // Profile photo is optional for applying; do not block on it
    if (!has(p.examPath)) missing.push('Exam Path')
    if (!has(p.medium)) missing.push('Medium')
    if (p.examPath === 'NATIONAL') {
      if (!has(p.sscRoll)) missing.push('SSC Roll')
      if (!has(p.sscRegistration)) missing.push('SSC Registration')
      if (!has(p.sscGpa)) missing.push('SSC GPA')
      if (!has(p.sscYear)) missing.push('SSC Year')
      if (!has(p.sscBoard)) missing.push('SSC Board')
      if (!has(p.hscRoll)) missing.push('HSC Roll')
      if (!has(p.hscRegistration)) missing.push('HSC Registration')
      if (!has(p.hscGpa)) missing.push('HSC GPA')
      if (!has(p.hscYear)) missing.push('HSC Year')
      if (!has(p.hscBoard)) missing.push('HSC Board')
    } else if (p.examPath === 'MADRASHA') {
      if (!has(p.dakhilRoll)) missing.push('Dakhil Roll')
      if (!has(p.dakhilRegistration)) missing.push('Dakhil Registration')
      if (!has(p.dakhilGpa)) missing.push('Dakhil GPA')
      if (!has(p.dakhilYear)) missing.push('Dakhil Year')
      if (!has(p.dakhilBoard)) missing.push('Dakhil Board')
      if (!has(p.alimRoll)) missing.push('Alim Roll')
      if (!has(p.alimRegistration)) missing.push('Alim Registration')
      if (!has(p.alimGpa)) missing.push('Alim GPA')
      if (!has(p.alimYear)) missing.push('Alim Year')
      if (!has(p.alimBoard)) missing.push('Alim Board')
    }
    return missing
  }

  const doApply = async (unit: EligibleUnit) => {
    if (appliedUnits.has(unit.unitId)) {
      toast.info('You have already applied to this unit')
      return
    }
    const missing = getRequiredMissing(profile)
    if (missing.length > 0) {
      setMissingFields(missing)
      setMissingOpen(true)
      return
    }
    setPendingUnit(unit)
    setCenterOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-gray-700" onClick={() => navigate({ to: '/student/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Institutions
          </Button>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {loading ? 'Loading institution...' : (inst ? (inst.shortName ? `${inst.name} (${inst.shortName})` : inst.name) : 'Institution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-gray-600">Loading...</div>
            ) : !inst ? (
              <div className="py-8 text-gray-600">Institution not found or you are not eligible.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800">
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className='flex items-center justify-center w-12 h-12 rounded-full shadow-sm p-1'>
                    <img src={inst.logoUrl || '/logo.svg'} alt="Logo" className="h-8 w-8 object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{inst.name}</div>
                    <div className="text-sm text-gray-600">{inst.shortName || '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Website</div>
                  <div>
                    {inst.website ? (
                      <a className="text-blue-600 hover:underline break-all" href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`} target="_blank" rel="noreferrer">{inst.website}</a>
                    ) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div>{inst.type || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ownership</div>
                  <div>{inst.ownership || '-'}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm text-gray-500">Address</div>
                  <div>{inst.address || '-'}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm text-gray-500">Description</div>
                  <div>{inst.description || '-'}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Units</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-gray-600">Loading units...</div>
            ) : !inst || !inst.units || inst.units.length === 0 ? (
              <div className="py-8 text-gray-600">No units available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inst.units.map((u) => (
                  <div key={u.unitId} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-900 font-medium">{u.name}</div>
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-800" disabled={applying === u.unitId || u.eligible === false || appliedUnits.has(u.unitId)} onClick={() => doApply(u)} title={appliedUnits.has(u.unitId) ? 'Already applied' : (u.eligible === false ? 'You are not eligible for this unit' : undefined)}>
                        {applying === u.unitId
                          ? 'Applying...'
                          : appliedUnits.has(u.unitId)
                            ? 'Applied'
                            : (u.eligible === false ? 'Not Eligible' : 'Apply')}
                      </Button>
                    </div>
                    {u.description ? (
                      <div className="text-sm text-gray-700 mt-1 line-clamp-2">{u.description}</div>
                    ) : null}
                    <div className="text-xs text-gray-600 mt-2">
                      Deadline: {u.applicationDeadline ? new Date(u.applicationDeadline).toLocaleString() : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Dialog open={missingOpen} onOpenChange={setMissingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile to Apply</DialogTitle>
            <DialogDescription>
              Please provide the following information before applying to a unit:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {missingFields.length === 0 ? (
              <div className="text-gray-600">All required information is present.</div>
            ) : (
              <ul className="list-disc list-inside text-gray-800">
                {missingFields.map((m) => (<li key={m}>{m}</li>))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setMissingOpen(false)}>Close</Button>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => { setMissingOpen(false); navigate({ to: '/student/dashboard' }) }}>Go to Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Choose exam center dialog */}
      <Dialog open={centerOpen} onOpenChange={(open) => { setCenterOpen(open); if (!open) setPendingUnit(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Exam Region</DialogTitle>
            <DialogDescription>Select your preferred division for the exam region.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Division</label>
            <Select value={center} onValueChange={(v) => setCenter(v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select division" /></SelectTrigger>
              <SelectContent>
                {['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setCenterOpen(false); setPendingUnit(null) }}>Cancel</Button>
            <Button className="bg-gray-900 hover:bg-gray-800" disabled={applying === pendingUnit?.unitId} onClick={async () => {
              if (!pendingUnit) return
              setApplying(pendingUnit.unitId)
              try {
                await applyToUnit(pendingUnit.unitId, center)
                toast.success('Application submitted', { description: `${pendingUnit.name}` })
                setAppliedUnits((prev) => new Set(prev).add(pendingUnit.unitId))
                setCenterOpen(false)
                setPendingUnit(null)
              } catch (e: unknown) {
                const err = e as { response?: { data?: { message?: string } } }
                const msg = err?.response?.data?.message || 'Failed to submit application'
                toast.error(msg)
              } finally {
                setApplying(null)
              }
            }}>{applying === pendingUnit?.unitId ? 'Applying...' : 'Apply'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RouteComponent
