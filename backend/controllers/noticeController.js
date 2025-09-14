// backend/controllers/noticeController.js
import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import {
  createSystemNoticeSchema,
  updateSystemNoticeSchema,
  createInstitutionNoticeSchema,
  updateInstitutionNoticeSchema,
} from "../validations/noticeValidation.js";

// Helpers
const toAudienceFilterForInstitution = () => ({ in: ["INSTITUTION", "BOTH"] });
const toAudienceFilterForStudent = () => ({ in: ["STUDENT", "BOTH"] });

class NoticeController {
  // ============== System Admin: CRUD own notices ==============
  static async systemCreate(req, res) {
    try {
      const validator = vine.compile(createSystemNoticeSchema);
      const payload = await validator.validate(req.body);

      const systemAdminId = req.admin?.systemAdminId;
      if (!systemAdminId) {
        return res.status(403).json({ status: 403, message: "Access denied" });
      }

      const data = {
        title: payload.title,
        content: payload.content,
        audience: payload.audience,
        category: payload.category ?? "GENERAL",
        published: true,
        publishedAt: new Date(),
        createdBySystemAdminId: systemAdminId,
      };

      const notice = await prisma.notice.create({ data });
      return res.status(201).json({ status: 201, message: "Notice created", notice });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
      console.error("systemCreate error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async systemList(req, res) {
    try {
      const { audience, category, search } = req.query;
      const where = { createdBySystemAdminId: { not: null } };
      if (audience && typeof audience === "string") where.audience = audience;
      if (category && typeof category === "string") where.category = category;
      if (search && typeof search === "string") {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ];
      }
      const notices = await prisma.notice.findMany({
        where,
        orderBy: { publishedAt: "desc" },
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("systemList error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async systemUpdate(req, res) {
    try {
      const { id } = req.params;
      const systemAdminId = req.admin?.systemAdminId;
      const validator = vine.compile(updateSystemNoticeSchema);
      const payload = await validator.validate(req.body);

      const existing = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!existing || existing.createdBySystemAdminId !== systemAdminId) {
        return res.status(404).json({ status: 404, message: "Notice not found" });
      }

      const updated = await prisma.notice.update({
        where: { noticeId: id },
        data: {
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.content !== undefined ? { content: payload.content } : {}),
          ...(payload.audience !== undefined ? { audience: payload.audience } : {}),
          ...(payload.category !== undefined ? { category: payload.category } : {}),
          ...(payload.published !== undefined ? { published: payload.published } : {}),
        },
      });
      return res.status(200).json({ status: 200, message: "Notice updated", notice: updated });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
      console.error("systemUpdate error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async systemDelete(req, res) {
    try {
      const { id } = req.params;
      const systemAdminId = req.admin?.systemAdminId;
      const existing = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!existing || existing.createdBySystemAdminId !== systemAdminId) {
        return res.status(404).json({ status: 404, message: "Notice not found" });
      }
      await prisma.notice.delete({ where: { noticeId: id } });
      return res.status(200).json({ status: 200, message: "Notice deleted", noticeId: id });
    } catch (error) {
      console.error("systemDelete error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  // Feed for System Admin: show institution academic notices
  static async systemFeed(req, res) {
    try {
      const notices = await prisma.notice.findMany({
        where: { institutionId: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("systemFeed error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  // ============== Institution Admin: CRUD own notices ==============
  static async institutionCreate(req, res) {
    try {
      const validator = vine.compile(createInstitutionNoticeSchema);
      const payload = await validator.validate(req.body);
      const adminId = req.admin?.adminId;

      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }

      // Institution-created notices are ACADEMIC and visible to both Students and System Admin feed
      const data = {
        title: payload.title,
        content: payload.content,
        audience: "BOTH",
        category: "ACADEMIC",
        published: true,
        publishedAt: new Date(),
        institutionId: admin.institutionId,
      };

      const notice = await prisma.notice.create({ data });
      return res.status(201).json({ status: 201, message: "Notice created", notice });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
      console.error("institutionCreate error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async institutionList(req, res) {
    try {
      const adminId = req.admin?.adminId;
      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }
      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            { createdBySystemAdminId: { not: null }, audience: toAudienceFilterForInstitution() },
            { institutionId: admin.institutionId },
          ],
        },
        orderBy: { publishedAt: "desc" },
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("institutionList error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async institutionMyNotices(req, res) {
    try {
      const adminId = req.admin?.adminId;
      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }
      const notices = await prisma.notice.findMany({
        where: { institutionId: admin.institutionId },
        orderBy: { publishedAt: "desc" },
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("institutionMyNotices error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async institutionUpdate(req, res) {
    try {
      const { id } = req.params;
      const validator = vine.compile(updateInstitutionNoticeSchema);
      const payload = await validator.validate(req.body);
      const adminId = req.admin?.adminId;

      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }
      const existing = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!existing || existing.institutionId !== admin.institutionId) {
        return res.status(404).json({ status: 404, message: "Notice not found" });
      }
      const updated = await prisma.notice.update({
        where: { noticeId: id },
        data: {
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.content !== undefined ? { content: payload.content } : {}),
          ...(payload.published !== undefined ? { published: payload.published } : {}),
        },
      });
      return res.status(200).json({ status: 200, message: "Notice updated", notice: updated });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
      console.error("institutionUpdate error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  static async institutionDelete(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.adminId;
      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }
      const existing = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!existing || existing.institutionId !== admin.institutionId) {
        return res.status(404).json({ status: 404, message: "Notice not found" });
      }
      await prisma.notice.delete({ where: { noticeId: id } });
      return res.status(200).json({ status: 200, message: "Notice deleted", noticeId: id });
    } catch (error) {
      console.error("institutionDelete error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  // Feed for Institution: show system admin notices to institutions + own
  static async institutionFeed(req, res) {
    try {
      const adminId = req.admin?.adminId;
      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: "No institution assigned" });
      }
      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            { createdBySystemAdminId: { not: null }, audience: toAudienceFilterForInstitution() },
            { institutionId: admin.institutionId },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("institutionFeed error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  // ============== Student Feed ==============
  static async studentFeed(req, res) {
    try {
      const notices = await prisma.notice.findMany({
        where: {
          OR: [
            { createdBySystemAdminId: { not: null }, audience: toAudienceFilterForStudent() },
            { institutionId: { not: null }, category: "ACADEMIC" },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
      return res.status(200).json({ status: 200, notices });
    } catch (error) {
      console.error("studentFeed error:", error);
      return res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }

  // ============== Get By ID (role-aware) ==============
  static async systemGetById(req, res) {
    try {
      const { id } = req.params;
      const notice = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!notice) return res.status(404).json({ status: 404, message: 'Notice not found' });
      return res.status(200).json({ status: 200, notice });
    } catch (error) {
      console.error('systemGetById error:', error);
      return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
  }

  static async institutionGetById(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.adminId;
      const admin = await prisma.admin.findUnique({ where: { adminId } });
      if (!admin || !admin.institutionId) {
        return res.status(403).json({ status: 403, message: 'No institution assigned' });
      }
      const notice = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!notice) return res.status(404).json({ status: 404, message: 'Notice not found' });
      const allowed = (
        // Own institution notice
        (notice.institutionId != null && notice.institutionId === admin.institutionId) ||
        // System admin notice targeted to institutions
        (notice.createdBySystemAdminId != null && (notice.audience === 'INSTITUTION' || notice.audience === 'BOTH'))
      );
      if (!allowed) return res.status(404).json({ status: 404, message: 'Notice not found' });
      return res.status(200).json({ status: 200, notice });
    } catch (error) {
      console.error('institutionGetById error:', error);
      return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
  }

  static async studentGetById(req, res) {
    try {
      const { id } = req.params;
      const notice = await prisma.notice.findUnique({ where: { noticeId: id } });
      if (!notice) return res.status(404).json({ status: 404, message: 'Notice not found' });
      const allowed = (
        // System admin notice targeted to students
        (notice.createdBySystemAdminId != null && (notice.audience === 'STUDENT' || notice.audience === 'BOTH')) ||
        // Institution academic notices are visible to students
        (notice.institutionId != null && notice.category === 'ACADEMIC')
      );
      if (!allowed) return res.status(404).json({ status: 404, message: 'Notice not found' });
      return res.status(200).json({ status: 200, notice });
    } catch (error) {
      console.error('studentGetById error:', error);
      return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
  }
}

export default NoticeController;
