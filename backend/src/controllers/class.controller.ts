import ClassService from "../services/class.service";
import { Request, Response } from "express";
import { CustomRequest } from "@/middleware/auth";
import formatResponse from "@/utils/formatResponse";
import getErrorStatusCode from "@/utils/getErrorStatusCode";

class ClassController {
  async createClass(req: CustomRequest, res: Response) {
    try {
      const classData = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new Error("User not authenticated");
      }

      if (req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
        throw new Error("Only teachers and admins can create classes");
      }

      const newClass = await ClassService.createClass({ ...classData, teacherId });

      res.status(201).json(formatResponse(
        "success", "Class created successfully", newClass
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

  async updateClassMaterial(req: CustomRequest, res: Response) {
    try {
      const { classId } = req.params;
      const { material } = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        throw new Error("User not authenticated");
      }

      if (req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
        throw new Error("Only teachers and admins can update class materials");
      }

      const updatedClass = await ClassService.updateClassMaterial(classId, material, teacherId);

      res.status(200).json(formatResponse(
        "success", "Class material updated successfully", updatedClass
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

  async getClasses(req: Request, res: Response) {
    try {
      const { teacherId, date } = req.query;
      const classes = await ClassService.getClasses({
        teacherId: teacherId as string,
        date: date ? new Date(date as string) : undefined
      });

      res.status(200).json(formatResponse(
        "success", "Classes retrieved successfully", classes
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

  async getClassById(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const classData = await ClassService.getClassById(classId);

      res.status(200).json(formatResponse(
        "success", "Class retrieved successfully", classData
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

  async getClassStats(req: CustomRequest, res: Response) {
    try {
      const teacherId = req.user?.role === "TEACHER" ? req.user.id : undefined;
      
      if (!req.user?.id) {
        throw new Error("User not authenticated");
      }

      const stats = await ClassService.getClassStats(teacherId);

      res.status(200).json(formatResponse(
        "success", "Class statistics retrieved successfully", stats
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

  async getAllClassesWithStatus(req: Request, res: Response) {
    try {
      const classes = await ClassService.getAllClassesWithStatus();

      res.status(200).json(formatResponse(
        "success", "All classes retrieved successfully", classes
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

  async deleteClass(req: CustomRequest, res: Response) {
    try {
      const { classId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
        throw new Error("Only teachers and admins can delete classes");
      }

      await ClassService.deleteClass(classId, userId, req.user.role);

      res.status(200).json(formatResponse(
        "success", "Class deleted successfully", null
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

export default new ClassController();
