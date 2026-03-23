import AttendanceService from "../services/attendance.service";
import { Response } from "express";
import { CustomRequest } from "@/middleware/auth";
import formatResponse from "@/utils/formatResponse";
import getErrorStatusCode from "@/utils/getErrorStatusCode";

class AttendanceController {
  async markAttendance(req: CustomRequest, res: Response) {
    try {
      const { classId, fingerprintData, faceData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const attendance = await AttendanceService.markAttendance({
        userId,
        classId,
        fingerprintData,
        faceData
      });

      res.status(201).json(formatResponse(
        "success", "Attendance marked successfully", attendance
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

  async getAttendanceByClass(req: CustomRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== "TEACHER" && req.user.role !== "ADMIN")) {
        throw new Error("Access denied. Only teachers and admins can view class attendance.");
      }

      const { classId } = req.params;
      const attendance = await AttendanceService.getAttendanceByClass(classId);

      res.status(200).json(formatResponse(
        "success", "Attendance retrieved successfully", attendance
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

  async getAttendanceByUser(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const attendance = await AttendanceService.getAttendanceByUser(userId);

      res.status(200).json(formatResponse(
        "success", "User attendance retrieved successfully", attendance
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

  async getAttendanceStats(req: CustomRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== "TEACHER" && req.user.role !== "ADMIN")) {
        throw new Error("Access denied. Only teachers and admins can view attendance statistics.");
      }

      const { classId } = req.params;
      const stats = await AttendanceService.getAttendanceStats(classId);

      res.status(200).json(formatResponse(
        "success", "Attendance statistics retrieved successfully", stats
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

export default new AttendanceController();
