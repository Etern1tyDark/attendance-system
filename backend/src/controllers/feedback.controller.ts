import FeedbackService from "@/services/feedback.service";
import formatResponse from "@/utils/formatResponse";
import { Response } from "express";
import { CustomRequest } from "@/middleware/auth";
import getErrorStatusCode from "@/utils/getErrorStatusCode";

class FeedbackController {
  async submitFeedback(req: CustomRequest, res: Response) {
    try {
      const { classId, rating, comment } = req.body;
      const studentId = req.user?.id;

      if (!studentId) {
        throw new Error("User not authenticated");
      }

      if (req.user?.role !== 'STUDENT') {
        throw new Error("Only students can submit feedback");
      }

      const feedback = await FeedbackService.submitFeedback({
        studentId,
        classId,
        rating,
        comment
      });

      res.status(201).json(formatResponse(
        "success", "Feedback submitted successfully", feedback
      ));
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async getFeedbackByClass(req: CustomRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== "TEACHER" && req.user.role !== "ADMIN")) {
        throw new Error("Access denied. Only teachers and admins can view class feedback.");
      }

      const { classId } = req.params;
      const feedback = await FeedbackService.getFeedbackByClass(classId);

      res.status(200).json(formatResponse(
        "success", "Feedback retrieved successfully", feedback
      ));
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async getFeedbackByStudent(req: CustomRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        throw new Error("User not authenticated");
      }

      const feedback = await FeedbackService.getFeedbackByStudent(studentId);

      res.status(200).json(formatResponse(
        "success", "Student feedback retrieved successfully", feedback
      ));
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async updateFeedback(req: CustomRequest, res: Response) {
    try {
      const { feedbackId } = req.params;
      const { rating, comment } = req.body;
      const studentId = req.user?.id;

      if (!studentId) {
        throw new Error("User not authenticated");
      }

      const updatedFeedback = await FeedbackService.updateFeedback(feedbackId, {
        rating,
        comment,
        studentId
      });

      res.status(200).json(formatResponse(
        "success", "Feedback updated successfully", updatedFeedback
      ));
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }
}

export default new FeedbackController();
