import FeedbackController from "@/controllers/feedback.controller";
import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.post("/submit", authMiddleware, FeedbackController.submitFeedback);
router.get("/class/:classId", authMiddleware, FeedbackController.getFeedbackByClass);
router.get("/student", authMiddleware, FeedbackController.getFeedbackByStudent);
router.put("/:feedbackId", authMiddleware, FeedbackController.updateFeedback);

export default router;