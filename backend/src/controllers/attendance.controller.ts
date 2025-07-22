import AttendanceService from "../services/attendance.service";
import { Request, Response } from "express";
import { CustomRequest } from "@/middleware/auth";
import formatResponse from "@/utils/formatResponse";

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
        res.status(500).json(formatResponse("error", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async getAttendanceByClass(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const attendance = await AttendanceService.getAttendanceByClass(classId);

      res.status(200).json(formatResponse(
        "success", "Attendance retrieved successfully", attendance
      ));
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json(formatResponse("error", error.message, null));
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
        res.status(500).json(formatResponse("error", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async getAttendanceStats(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const stats = await AttendanceService.getAttendanceStats(classId);

      res.status(200).json(formatResponse(
        "success", "Attendance statistics retrieved successfully", stats
      ));
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json(formatResponse("error", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }
}

export default new AttendanceController();
