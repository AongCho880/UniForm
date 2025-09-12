import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { getEligibleInstitutions, type EligibleInstitution } from '@/api/studentExplore'

import type { MyApplication } from '@/api/studentApplications'
import type { User } from '@/context/student/AuthContext'

interface AdmitCardProps {
  app: MyApplication
  student: User
  institutionLogoUrl?: string
}

export default function AdmitCard({ app, student, institutionLogoUrl }: AdmitCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [resolvedLogo, setResolvedLogo] = useState<string | null>(
    institutionLogoUrl || app?.institution?.logoUrl || null
  )

  const API_ORIGIN = useMemo(() => {
    const API_URL = ((import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || 'http://localhost:5000/api'
    return API_URL.replace(/\/api\/?$/, '')
  }, [])
  const appLogoUrl = app?.institution?.logoUrl || null

  // Keep resolvedLogo in sync when logo props arrive later
  useEffect(() => {
    if (institutionLogoUrl) {
      setResolvedLogo(institutionLogoUrl)
    } else if (appLogoUrl) {
      setResolvedLogo(appLogoUrl)
    }
  }, [institutionLogoUrl, appLogoUrl])

  useEffect(() => {
    if (institutionLogoUrl || app?.institution?.logoUrl) return
    const normalize = (s?: string | null) => (s || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      ; (async () => {
        try {
          const list = await getEligibleInstitutions()
          const target = normalize(app.institution?.name)
          let found: EligibleInstitution | undefined
          found = list.find(i => normalize(i.name) === target)
          if (!found) found = list.find(i => normalize(i.name).includes(target) || target.includes(normalize(i.name)))
          if (!found) found = list.find(i => normalize(i.shortName) === target)
          if (!found && app.unit?.name) {
            const unitNorm = normalize(app.unit.name)
            found = list.find(i => (i.units || []).some(u => normalize(u.name) === unitNorm))
          }
          if (found?.logoUrl) setResolvedLogo(found.logoUrl)
        } catch (e) { void e }
      })()
  }, [app, institutionLogoUrl])

  const safe = (v?: string | null) => (v && String(v).trim().length > 0 ? v : '-')
  const candidatePhoto = useMemo<string>(() => {
    const fromProp = (student?.profile || '').trim()
    if (fromProp) return fromProp
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const cached = JSON.parse(raw)
        const fromCache = (cached?.profile || '').trim()
        if (fromCache) return fromCache
      }
    } catch (e) { void e }
    return '/logo.svg'
  }, [student.profile])
  const instLogo = useMemo<string>(() => {
    const raw = resolvedLogo
    if (!raw || raw.trim() === '') return '/logo.svg'
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw
    if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`
    return `${API_ORIGIN}/${raw}`
  }, [resolvedLogo, API_ORIGIN])
  const isCorsAllowed = useCallback((src?: string | null) => {
    if (!src) return false
    try {
      const u = new URL(src, window.location.href)
      if (u.protocol === 'data:' || u.protocol === 'blob:') return true
      return u.origin === window.location.origin || u.origin === API_ORIGIN
    } catch {
      return false
    }
  }, [API_ORIGIN])
  const logoCrossOrigin = useMemo(() => isCorsAllowed(instLogo), [isCorsAllowed, instLogo])
  const photoCrossOrigin = useMemo(() => isCorsAllowed(candidatePhoto), [isCorsAllowed, candidatePhoto])

  // Download/export helpers removed per request. Only Print/Save via browser remains.

  const openPdfInNewTab = useCallback(async () => {
    const node = cardRef.current
    if (!node) return

    // Open a blank tab immediately (within user gesture) to avoid popup blocking
    const win = window.open('', '_blank')
    if (win) {
      try {
        win.document.write('<p style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding:16px;">Preparing PDF…</p>')
      } catch { /* ignore */ }
    }

    try {
      // Measure full content area
      const rect = node.getBoundingClientRect()
      const cardW = Math.ceil(Math.max(node.scrollWidth, node.clientWidth, rect.width))
      const cardH = Math.ceil(Math.max(node.scrollHeight, node.clientHeight, rect.height))

      // Render card to canvas
      const canvas = await html2canvas(node, {
        scale: window.devicePixelRatio > 1 ? 2 : 1.5,
        useCORS: true,
        foreignObjectRendering: true,
        backgroundColor: '#ffffff',
        width: cardW,
        height: cardH,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          try {
            const root = doc.querySelector('[data-admit-root]') as HTMLElement | null
            if (root) {
              root.style.overflow = 'visible'
              root.style.height = 'auto'
              root.style.maxHeight = 'none'
            }
            // Replace non-CORS images to avoid tainted canvas
            const sameOrigin = window.location.origin
            const imgs = doc.querySelectorAll('img[data-admit-image]') as NodeListOf<HTMLImageElement>
            imgs.forEach((img) => {
              try {
                const src = img.getAttribute('src') || ''
                const u = new URL(src, window.location.href)
                const isSafe = u.protocol === 'data:' || u.protocol === 'blob:' || u.origin === sameOrigin || u.origin === API_ORIGIN
                if (!isSafe) img.src = '/logo.svg'
              } catch { /* ignore */ }
            })
          } catch { /* ignore */ }
        },
      })

      // Compose A4 PDF portrait with margins and open in the pre-opened tab
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 24
      const innerW = pageW - margin * 2
      const innerH = pageH - margin * 2
      const imgW = canvas.width
      const imgH = canvas.height
      const scale = Math.min(innerW / imgW, innerH / imgH)
      const drawW = Math.round(imgW * scale)
      const drawH = Math.round(imgH * scale)
      const x = Math.round(margin + (innerW - drawW) / 2)
      const y = Math.round(margin + (innerH - drawH) / 2)
      const dataUrl = canvas.toDataURL('image/png')
      pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH)

      const blob = pdf.output('blob') as Blob
      const url = URL.createObjectURL(blob)
      if (win && !win.closed) {
        win.location.href = url
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      } else {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      }
    } catch (err) {
      // Fallback: try triggering print dialog as a last resort
      try { if (win && !win.closed) win.close() } catch { /* ignore */ }
      console.error('PDF generation failed', err)
      window.print()
    }
  }, [API_ORIGIN])

  return (
    <div className="w-full">
      {/* Print-only CSS: hides everything except the card and formats A4 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media print {
  @page { size: A4 portrait; margin: 12mm 12mm 14mm 12mm; }
  html, body { background: #ffffff !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body * { visibility: hidden !important; }
  #admit-card-print, #admit-card-print * { visibility: visible !important; }
  #admit-card-print {
    position: static !important;
    margin: 0 auto !important;
    width: 190mm !important;
    max-width: 190mm !important;
  }
  /* Avoid breaking boxes across pages */
  #admit-card-print .no-break { break-inside: avoid; page-break-inside: avoid; }
}
        ` }}
      />
      {/* Visible card (also used for PDF rasterization) */}
      <div
        ref={cardRef}
        className="bg-white border-2 border-black rounded-md p-0 max-w-[1200px] w-full mx-auto shadow-sm"
        data-admit-root
        id="admit-card-print"
      >
        {/* Header (black & white) */}
        <div className="bg-white text-black rounded-t-[5px] px-6 py-4 flex items-center justify-between border-b border-black no-break">
          <div className="flex items-center gap-3">
            {/* Keep logo colorful. Use CORS only when allowed to avoid blocking image load. */}
            <img
              src={instLogo}
              alt="Institution Logo"
              {...(logoCrossOrigin ? { crossOrigin: 'anonymous' as const, referrerPolicy: 'no-referrer' as const } : {})}
              data-admit-image="logo"
              className="h-14 p-1 border rounded-sm"
            />
            <div>
              <div className="text-xl font-bold leading-tight">{safe(app.institution?.name)}</div>
              <div className="text-xs">Bangladesh</div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-white text-black font-semibold px-3 py-1 rounded-sm border border-black">ADMIT CARD</div>
          </div>
        </div>

        {/* Top meta strip (keep concise – no SSC/HSC here) */}
        <div className="px-6 py-2 text-xs text-black border-b border-black flex flex-wrap items-center gap-x-6 gap-y-1 justify-between no-break">
          <div>Application ID: <span className="font-medium">{app.id}</span></div>
          <div>Issued: <span className="font-medium">{new Date().toLocaleDateString()}</span></div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-3 gap-4 no-break">
          {/* Candidate photo (left, keep colorful) */}
          <div className="col-span-1">
            <div className="border border-black rounded-sm p-2 flex items-center justify-center h-56">
              <img
                src={candidatePhoto}
                alt="Candidate"
                {...(photoCrossOrigin ? { crossOrigin: 'anonymous' as const, referrerPolicy: 'no-referrer' as const } : {})}
                data-admit-image="photo"
                className="h-full object-cover rounded-sm"
              />
            </div>
            <div className="mt-2 text-center text-xs text-gray-600">Candidate Photograph</div>
          </div>

          {/* Student Information (right) */}
          <div className="col-span-2 border border-black rounded-sm p-4 text-sm">
            <div className="grid grid-cols-3 gap-x-3 gap-y-1">
              <div className="text-black">Applicant Name</div>
              <div className="col-span-2 text-black font-medium">{safe(student.userName)}</div>

              <div className="text-black">Application ID</div>
              <div className="col-span-2 text-black">{app.id}</div>

              <div className="text-black">Program / Unit</div>
              <div className="col-span-2 text-black">{safe(app.unit?.name)}</div>

              <div className="text-black">Exam Path</div>
              <div className="col-span-2 text-black">{safe(student.examPath)}</div>

              <div className="text-black">Medium</div>
              <div className="col-span-2 text-black">{safe(student.medium)}</div>

              {student.examPath === 'NATIONAL' ? (
                <>
                  <div className="text-black">SSC Roll</div>
                  <div className="col-span-2 text-black">{safe(student.sscRoll)}</div>
                  <div className="text-black">SSC Registration</div>
                  <div className="col-span-2 text-black">{safe(student.sscRegistration)}</div>
                  <div className="text-black">SSC Board</div>
                  <div className="col-span-2 text-black">{safe(student.sscBoard)}</div>
                  <div className="text-black">SSC Year</div>
                  <div className="col-span-2 text-black">{safe(student.sscYear)}</div>

                  <div className="text-black">HSC Roll</div>
                  <div className="col-span-2 text-black">{safe(student.hscRoll)}</div>
                  <div className="text-black">HSC Registration</div>
                  <div className="col-span-2 text-black">{safe(student.hscRegistration)}</div>
                  <div className="text-black">HSC Board</div>
                  <div className="col-span-2 text-black">{safe(student.hscBoard)}</div>
                  <div className="text-black">HSC Year</div>
                  <div className="col-span-2 text-black">{safe(student.hscYear)}</div>
                </>
              ) : (
                <>
                  <div className="text-black">Dakhil Roll</div>
                  <div className="col-span-2 text-black">{safe(student.dakhilRoll)}</div>
                  <div className="text-black">Dakhil Registration</div>
                  <div className="col-span-2 text-black">{safe(student.dakhilRegistration)}</div>
                  <div className="text-black">Dakhil Board</div>
                  <div className="col-span-2 text-black">{safe(student.dakhilBoard)}</div>
                  <div className="text-black">Dakhil Year</div>
                  <div className="col-span-2 text-black">{safe(student.dakhilYear)}</div>

                  <div className="text-black">Alim Roll</div>
                  <div className="col-span-2 text-black">{safe(student.alimRoll)}</div>
                  <div className="text-black">Alim Registration</div>
                  <div className="col-span-2 text-black">{safe(student.alimRegistration)}</div>
                  <div className="text-black">Alim Board</div>
                  <div className="col-span-2 text-black">{safe(student.alimBoard)}</div>
                  <div className="text-black">Alim Year</div>
                  <div className="col-span-2 text-black">{safe(student.alimYear)}</div>
                </>
              )}

              <div className="text-black">Applied On</div>
              <div className="col-span-2 text-black">{new Date(app.appliedAt).toLocaleString()}</div>

              <div className="text-black">Approved On</div>
              <div className="col-span-2 text-black">{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>

        {/* Exam details */}
        <div className="px-6 pb-2 no-break">
          <div className="border border-black rounded-sm p-4 text-sm no-break">
            <div className="text-black font-medium mb-2">Exam Details</div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <div className="text-black text-xs">Seat No.</div>
                <div className="text-black">{safe(app.seatNo)}</div>
              </div>
              <div>
                <div className="text-black text-xs">Exam Date</div>
                <div className="text-black">{app?.examDate ? new Date(app.examDate).toLocaleDateString() : (app?.unit?.examDate ? new Date(app.unit.examDate).toLocaleDateString() : '-')}</div>
              </div>
              <div>
                <div className="text-black text-xs">Exam Time</div>
                <div className="text-black">{safe(app.examTime || app.unit?.examTime)}</div>
              </div>
              <div>
                <div className="text-black text-xs">Center</div>
                <div className="text-black">{safe(app.examCenter || app.unit?.examCenter || app.centerPreference)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer signatures */}
        <div className="px-6 mt-4 grid grid-cols-2 gap-6 no-break">
          <div className="text-center">
            <div className="h-10"></div>
            <div className="border-t border-black inline-block px-8 text-sm text-black">Applicant's Signature</div>
          </div>
          <div className="text-center">
            <div className="h-10"></div>
            <div className="border-t border-black inline-block px-8 text-sm text-black">Authorized Signature</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-6 mt-4 mb-2 border border-black rounded-sm p-3 no-break">
          <div className="text-sm font-medium text-black mb-1">Instructions</div>
          <ul className="text-xs text-black list-disc list-inside space-y-1">
            <li>Bring this admit card and a valid photo ID on exam day.</li>
            <li>Electronic devices and notes are strictly prohibited inside the exam hall.</li>
            <li>Arrive at least 30 minutes before the scheduled time.</li>
          </ul>
        </div>

        {/* Branding */}
        <div className="pb-5 flex items-center justify-center gap-2 text-[10px] text-black">
          <img
            src="/logo.svg"
            alt="Uniform Logo"
            className="h-3 w-3 object-contain"
          />
          <span>Powered by Uniform</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => void openPdfInNewTab()}>
          Download PDF
        </Button>
        <Button variant="secondary" className="border border-gray-300 text-gray-800 hover:bg-gray-100" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>
    </div>
  )
}
