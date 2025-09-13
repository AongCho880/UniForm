// backend/routes/systemAdminRoute.js
// import adminAuthController from "../controllers/adminAuthController.js";
import { Router } from "express";
import {
	default as institutionController,
	default as systemAdminAuthController,
} from "../controllers/systemAdminAuthController.js";
import { cacheRoute } from "../middleware/cache.js";
import { bustUserCache } from "../middleware/cacheBust.js";
import unitController from "../controllers/unitController.js";
import systemAdminMiddleware from "../middleware/systemAdminMiddleware.js";

const router = Router();

router.post("/auth/login", systemAdminAuthController.login);

// System_Admin routes
router.post(
	"/admins/create-and-assign",
	systemAdminMiddleware, // Only SYSTEM_ADMIN can access
	bustUserCache({ scope: "/api/system" }),
	systemAdminAuthController.createAndAssignInstitutionAdmin
);

router.get(
	"/admins/profile",
	systemAdminMiddleware, // Only SYSTEM_ADMIN can access
	cacheRoute({ ttl: 300 }),
	systemAdminAuthController.index
);

router.get(
	"/admins",
	systemAdminMiddleware,
	cacheRoute({ ttl: 300 }),
	systemAdminAuthController.fetchAdmins
);

// Institution routes
router.post(
	"/institutions",
	systemAdminMiddleware,
	bustUserCache({ scope: "/api/system" }),
	institutionController.createInstitution
);

router.delete(
    "/institutions/:institutionId",
    systemAdminMiddleware,
    bustUserCache({ scope: "/api/system" }),
    institutionController.deleteInstitution
);

router.get(
    "/institutions/:institutionId",
    systemAdminMiddleware,
    institutionController.getInstitutionById
);

router.put(
    "/institutions/:institutionId",
    systemAdminMiddleware,
    bustUserCache({ scope: "/api/system" }),
    institutionController.updateInstitution
);

// Note: Assign/Unassign admin endpoints removed per requirements

router.get(
    "/institutions",
    systemAdminMiddleware,
    // Return fresh data to reflect changes immediately in admin UI
    cacheRoute({ ttl: 0 }),
    systemAdminAuthController.fetchInstitutions
);

router.delete(
    "/admins/:adminId",
    systemAdminMiddleware,
    bustUserCache({ scope: "/api/system" }),
    systemAdminAuthController.deleteAdmin
);

router.put(
	"/admins/update-password",
	systemAdminMiddleware,
	systemAdminAuthController.updatePassword
);

router.put(
	"/admins/update-email",
	systemAdminMiddleware,
	systemAdminAuthController.updateEmail
);

// Dashboard stats for system admin
router.get(
    "/dashboard",
    systemAdminMiddleware,
    unitController.dashboard
);

export default router;
