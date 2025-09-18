import { useEffect, useState } from 'react'
import { getEligibleInstitutions, type EligibleInstitution } from '@/api/studentExplore'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from '@tanstack/react-router'
import { getUserProfile, getAcademicDetails } from '@/api'
import type { User } from '@/context/student/AuthContext'
import { Button } from '@/components/ui/button'

export default function UniversitiesSection() {
  const [rows, setRows] = useState<EligibleInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<User | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const [data, p, a] = await Promise.all([
          getEligibleInstitutions(),
          getUserProfile(),
          getAcademicDetails(),
        ])
        setRows(data)
        const merged: User | null = p && a ? { ...p, ...a } : (p || a)
        setProfile(merged)
        setMissingFields(getRequiredMissing(merged))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const getRequiredMissing = (p: User | null): string[] => {
    const missing: string[] = []
    const has = (v: unknown): boolean => {
      if (v === null || v === undefined) return false
      if (typeof v === 'string') return v.trim().length > 0
      if (typeof v === 'number') return !Number.isNaN(v)
      return !!v
    }
    if (!p) return ['Profile information not loaded']
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

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Institution</h2>
        <p className="mt-1 text-gray-600">Showing eligible units based on your profile</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading eligible universities...</div>
      ) : rows.length === 0 ? (
        <Card className="border-gray-200">
          <div className="py-10 px-6 text-center">
            <div className="text-lg font-medium text-gray-900">No eligible units found</div>
            {missingFields.length > 0 ? (
              <div className="mt-2 text-gray-600">
                Reason: Missing required profile details.
                <ul className="mt-2 list-disc list-inside text-left inline-block text-sm text-gray-700">
                  {missingFields.map((m) => (<li key={m}>{m}</li>))}
                </ul>
              </div>
            ) : (
              <div className="mt-2 text-gray-600">
                Reason: Your GPA/streams/passing years do not meet any unit's minimum requirements yet.
              </div>
            )}
            <div className="mt-4">
              <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => navigate({ to: '/student/dashboard' })}>
                Review / Update Profile
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inst) => (
                <TableRow
                  key={inst.institutionId}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/student/institutions/$institutionId',
                      params: { institutionId: inst.institutionId },
                    })
                  }
                >
                  <TableCell className="w-12">
                    {inst.logoUrl ? (
                      <img
                        src={inst.logoUrl}
                        alt={`${inst.name} logo`}
                        className="h-8 w-8 rounded object-cover"
                        loading="lazy"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">
                    {inst.name}
                    {inst.shortName ? ` (${inst.shortName})` : ''}
                  </TableCell>
                  <TableCell>
                    {inst.website ? (
                      <a
                        className="text-black hover:underline"
                        href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inst.website}
                      </a>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-gray-700">{inst.type ?? '—'}</TableCell>
                  <TableCell className="text-gray-700">{inst.ownership ?? '—'}</TableCell>
                  <TableCell className="text-gray-700">{inst.units?.length ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
