export type NoticeAudience = 'STUDENT' | 'INSTITUTION' | 'BOTH'
export type NoticeCategory = 'GENERAL' | 'ACADEMIC'

export interface Notice {
  noticeId: string
  title: string
  content: string
  audience: NoticeAudience
  category: NoticeCategory
  published: boolean
  publishedAt: string | null
  createdBySystemAdminId?: string | null
  institutionId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSystemNoticeInput {
  title: string
  content: string
  audience: NoticeAudience
  category?: NoticeCategory
}

export interface UpdateSystemNoticeInput {
  title?: string
  content?: string
  audience?: NoticeAudience
  category?: NoticeCategory
  published?: boolean
}

export interface CreateInstitutionNoticeInput {
  title: string
  content: string
}

export interface UpdateInstitutionNoticeInput {
  title?: string
  content?: string
  published?: boolean
}

