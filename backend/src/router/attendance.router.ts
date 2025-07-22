import AttendanceController from "@/controllers/attendance.controller";
import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.post("/mark", authMiddleware, AttendanceController.markAttendance);
router.get("/class/:classId", authMiddleware, AttendanceController.getAttendanceByClass);
router.get("/user", authMiddleware, AttendanceController.getAttendanceByUser);
router.get("/stats/:classId", authMiddleware, AttendanceController.getAttendanceStats);

export default router;
