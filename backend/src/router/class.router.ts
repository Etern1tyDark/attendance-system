import ClassController from "@/controllers/class.controller";
import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.post("/", authMiddleware, ClassController.createClass);
router.put("/:classId/material", authMiddleware, ClassController.updateClassMaterial);
router.get("/", authMiddleware, ClassController.getClasses);
router.get("/all", authMiddleware, ClassController.getAllClassesWithStatus);
router.get("/stats", authMiddleware, ClassController.getClassStats);
router.get("/:classId", authMiddleware, ClassController.getClassById);
router.delete("/:classId", authMiddleware, ClassController.deleteClass);

export default router;
