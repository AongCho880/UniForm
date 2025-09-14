import api from './axios'
import type {
  Notice,
  CreateSystemNoticeInput,
  UpdateSystemNoticeInput,
  CreateInstitutionNoticeInput,
  UpdateInstitutionNoticeInput,
} from '@/types/notice'

// Student
export async function getStudentNoticeFeed(): Promise<Notice[]> {
  const res = await api.get('/notices')
  return (res.data?.notices ?? []) as Notice[]
}

// Institution Admin
export async function createInstitutionNotice(input: CreateInstitutionNoticeInput): Promise<Notice> {
  const res = await api.post('/admin/notices', input)
  return res.data?.notice as Notice
}

export async function getInstitutionNoticeFeed(): Promise<Notice[]> {
  const res = await api.get('/admin/notices/feed')
  return (res.data?.notices ?? []) as Notice[]
}

export async function getMyInstitutionNotices(): Promise<Notice[]> {
  const res = await api.get('/admin/notices')
  return (res.data?.notices ?? []) as Notice[]
}

export async function updateInstitutionNotice(id: string, input: UpdateInstitutionNoticeInput): Promise<Notice> {
  const res = await api.put(`/admin/notices/${id}`, input)
  return res.data?.notice as Notice
}

export async function deleteInstitutionNotice(id: string): Promise<boolean> {
  const res = await api.delete(`/admin/notices/${id}`)
  return res.data?.status === 200
}

export async function getInstitutionNoticeById(id: string): Promise<Notice> {
  const res = await api.get(`/admin/notices/${id}`)
  return res.data?.notice as Notice
}

// System Admin
export async function createSystemNotice(input: CreateSystemNoticeInput): Promise<Notice> {
  const res = await api.post('/system/notices', input)
  return res.data?.notice as Notice
}

export async function listSystemNotices(params?: { audience?: 'STUDENT'|'INSTITUTION'|'BOTH', category?: 'GENERAL'|'ACADEMIC', search?: string }): Promise<Notice[]> {
  const res = await api.get('/system/notices', { params })
  return (res.data?.notices ?? []) as Notice[]
}

export async function updateSystemNotice(id: string, input: UpdateSystemNoticeInput): Promise<Notice> {
  const res = await api.put(`/system/notices/${id}`, input)
  return res.data?.notice as Notice
}

export async function deleteSystemNotice(id: string): Promise<boolean> {
  const res = await api.delete(`/system/notices/${id}`)
  return res.data?.status === 200
}

export async function getSystemNoticeFeed(): Promise<Notice[]> {
  const res = await api.get('/system/notices/feed')
  return (res.data?.notices ?? []) as Notice[]
}

export async function getSystemNoticeById(id: string): Promise<Notice> {
  const res = await api.get(`/system/notices/${id}`)
  return res.data?.notice as Notice
}

export async function getStudentNoticeById(id: string): Promise<Notice> {
  const res = await api.get(`/notices/${id}`)
  return res.data?.notice as Notice
}
