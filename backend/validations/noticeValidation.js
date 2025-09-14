// backend/validations/noticeValidation.js
import vine from "@vinejs/vine";

export const noticeAudienceEnum = ["STUDENT", "INSTITUTION", "BOTH"];
export const noticeCategoryEnum = ["GENERAL", "ACADEMIC"];

export const createSystemNoticeSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(255),
  content: vine.string().trim().minLength(10),
  audience: vine.enum(noticeAudienceEnum),
  category: vine.enum(noticeCategoryEnum).optional(), // default GENERAL
});

export const updateSystemNoticeSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(255).optional(),
  content: vine.string().trim().minLength(10).optional(),
  audience: vine.enum(noticeAudienceEnum).optional(),
  category: vine.enum(noticeCategoryEnum).optional(),
  published: vine.boolean().optional(),
});

export const createInstitutionNoticeSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(255),
  content: vine.string().trim().minLength(10),
  // audience is implicitly BOTH (student + system admin recipients)
});

export const updateInstitutionNoticeSchema = vine.object({
  title: vine.string().trim().minLength(3).maxLength(255).optional(),
  content: vine.string().trim().minLength(10).optional(),
  published: vine.boolean().optional(),
});

