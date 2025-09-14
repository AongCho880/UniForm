// backend/routes/api.js
import { Router } from "express";
import authController from "../controllers/AuthController.js";
import profileController from "../controllers/ProfileController.js";
import studentExploreController from "../controllers/studentExploreController.js";
import studentApplicationController from "../controllers/studentApplicationController.js";
import { cacheRoute } from "../middleware/cache.js";
import { studentLimiter, studentWriteLimiter, loginLimiter } from "../middleware/rateLimiters.js";
import authMiddleware from "../middleware/Authenticate.js";
import studentMiddleware from "../middleware/studentMiddleware.js";
import noticeController from "../controllers/noticeController.js";
const router = Router();

// Auth routes
// Auth — protect against brute force
router.post("/auth/register", loginLimiter, authController.register);
router.post("/auth/login", loginLimiter, authController.login);
router.put("/auth/update-email", studentMiddleware, studentWriteLimiter, authController.updateEmail);
router.delete(
  "/auth/delete-account",
  studentMiddleware,
  authController.deleteAccount
);
router.post(
  "/auth/change-password",
  studentMiddleware,
  studentWriteLimiter,
  authController.changePassword
);

// Profile routes
router.get(
  "/profile",
  studentMiddleware,
  studentLimiter,
  profileController.index
); // Private route (no cache to avoid stale profile image)
router.put("/profile/:id", studentMiddleware, studentWriteLimiter, profileController.update); // Private route

// AcademicInfo routes
router.get(
  "/academicInfo",
  studentMiddleware,
  studentLimiter,
  profileController.getAcademicDetails
); // Private route
router.get(
  "/academicInfo/:id",
  studentMiddleware,
  studentLimiter,
  profileController.getAcademicDetails
); // Private route

// Student eligibility-based exploration
router.get(
  "/institutions/eligible",
  studentMiddleware,
  studentLimiter,
  cacheRoute({ ttl: 120 }),
  studentExploreController.eligibleInstitutions
);

router.get(
  "/institutions/:institutionId/eligible",
  studentMiddleware,
  studentLimiter,
  cacheRoute({ ttl: 120 }),
  studentExploreController.eligibleInstitutionById
);

// Student applications
router.get(
  "/applications",
  studentMiddleware,
  studentLimiter,
  // Dynamic data; skip caching to prevent stale lists
  studentApplicationController.list
);
router.post(
  "/applications",
  studentMiddleware,
  studentWriteLimiter,
  studentApplicationController.create
);
router.delete(
  "/applications/:id",
  studentMiddleware,
  studentWriteLimiter,
  studentApplicationController.delete
);

// Student: Notice feed (system + institution academic)
router.get(
  "/notices",
  studentMiddleware,
  studentLimiter,
  noticeController.studentFeed
);

// Student: Notice detail by ID
router.get(
  "/notices/:id",
  studentMiddleware,
  studentLimiter,
  noticeController.studentGetById
);

export default router;
