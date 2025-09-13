import api from '@/api/axios'
import type { AdminUser } from '@/context/admin/authContext'

export const institutionAdminLogin = async (
  email: string,
  password: string
): Promise<AdminUser | null> => {
  const response = await api.post('/admin/auth/login', { email, password })
  if (response.data.status === 200) {
    localStorage.setItem('accessToken', response.data.access_token)
    const user: AdminUser = {
      userId: '',
      email,
      password: '',
      role: 'INSTITUTION_ADMIN',
    }
    return user
  }
  return null
}

export const getInstitutionDashboard = async (): Promise<{ units: number; students: number; applications: number }> => {
  const response = await api.get('/admin/dashboard')
  return response.data.data
}

export interface InstitutionAdminProfile {
  adminId: string;
  email: string;
  role: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  institutionId?: string | null;
}

export const getInstitutionAdminProfile = async (): Promise<InstitutionAdminProfile> => {
  const response = await api.get('/admin/profile')
  return response.data.profile as InstitutionAdminProfile
}

export const updateInstitutionAdminEmail = async (email: string): Promise<InstitutionAdminProfile> => {
  const response = await api.put('/admin/update-email', { email })
  return response.data.profile as InstitutionAdminProfile
}

export interface InstitutionInfo {
  institutionId: string
  name: string
  shortName?: string | null
  logoUrl?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  establishedYear?: number | null
  ownership?: 'PUBLIC' | 'PRIVATE' | null
  type?: 'GENERAL' | 'ENGINEERING' | null
}

export const getMyInstitution = async (): Promise<InstitutionInfo> => {
  const response = await api.get('/admin/institution')
  return response.data.institution as InstitutionInfo
}

export const updateMyInstitution = async (payload: { shortName?: string }) => {
  const response = await api.put('/admin/institution', payload)
  return response.data.institution as InstitutionInfo
}

export const updateInstitutionAdminPassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<{ status: number; message: string }> => {
  const response = await api.put('/admin/update-password', { oldPassword, newPassword })
  return response.data as { status: number; message: string }
}
