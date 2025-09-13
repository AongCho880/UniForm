// uniform-frontend/src/api/admin/adminApi.ts

import api from '@/api/axios';
import type { Institution, Admin, LoginResponse, SystemAdmin } from '@/types/admin';

export const adminApi = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/system/auth/login', { email, password });
    return response.data;
  },

  // Profile
  getProfile: async (): Promise<SystemAdmin> => {
    const response = await api.get('/system/admins/profile');
    return response.data.profile;
  },
  updateSystemAdminPassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ status: number; message: string }> => {
    const response = await api.put('/system/admins/update-password', data);
    return response.data;
  },
  updateSystemAdminEmail: async (email: string): Promise<SystemAdmin> => {
    const response = await api.put('/system/admins/update-email', { email });
    return response.data.profile;
  },

  // Institutions
  getInstitutions: async (): Promise<{ institutions: Institution[] }> => {
    const response = await api.get('/system/institutions');
    return response.data;
  },

  createInstitution: async (
    institutionData: {
      name: string;
      shortName?: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      establishedYear?: number;
      logoUrl?: string;
      categoryName?: string;
      ownership?: 'PUBLIC' | 'PRIVATE';
      type?: 'GENERAL' | 'ENGINEERING';
    }
  ): Promise<Institution> => {
    const response = await api.post('/system/institutions', institutionData);
    return response.data;
  },

  deleteInstitution: async (institutionId: string): Promise<void> => {
    await api.delete(`/system/institutions/${institutionId}`);
  },

  getInstitutionById: async (institutionId: string): Promise<Institution> => {
    const response = await api.get(`/system/institutions/${institutionId}`);
    return response.data.institution;
  },

  // Dashboard
  getDashboard: async (): Promise<{ institutions: number; units: number; students: number; applications: number }> => {
    const response = await api.get('/system/dashboard');
    return response.data.data;
  },

  updateInstitution: async (
    institutionId: string,
    data: {
      name: string;
      shortName?: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      establishedYear?: number;
      logoUrl?: string;
      categoryName?: string;
      ownership?: 'PUBLIC' | 'PRIVATE';
      type?: 'GENERAL' | 'ENGINEERING';
    }
  ): Promise<Institution> => {
    const response = await api.put(`/system/institutions/${institutionId}`, data);
    return response.data.institution;
  },

  // Admins
  getAdmins: async (
    params?: { page?: number; limit?: number; search?: string; institutionId?: string }
  ): Promise<{ admins: Admin[]; metadata?: { totalPages: number; currentPage: number; currentLimit: number; totalItems: number } }> => {
    const response = await api.get('/system/admins', { params });
    return response.data;
  },
  createAdmin: async (adminData: { email: string; password: string; password_confirmation: string; institutionId?: string }): Promise<Admin> => {
    const response = await api.post('/system/admins/create-and-assign', adminData);
    return response.data;
  },

  // Assign/Unassign endpoints removed per requirements

  deleteAdmin: async (adminId: string): Promise<void> => {
    await api.delete(`/system/admins/${adminId}`);
  },
};
