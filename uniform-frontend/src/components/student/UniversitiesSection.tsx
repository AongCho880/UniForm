import { useEffect, useState } from 'react'
import { getEligibleInstitutions, type EligibleInstitution } from '@/api/studentExplore'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from '@tanstack/react-router'

export default function UniversitiesSection() {
  const [rows, setRows] = useState<EligibleInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      const data = await getEligibleInstitutions()
      setRows(data)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Institution</h2>
        <p className="mt-1 text-gray-600">Showing eligible units based on your profile</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading eligible universities...</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-600">No eligible units found. Update your profile to see more options.</div>
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
