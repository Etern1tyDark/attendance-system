import UserService from "@/services/user.service";
import { Request, Response } from "express";
import { CustomRequest } from "@/middleware/auth";
import formatResponse from "@/utils/formatResponse";
import getErrorStatusCode from "@/utils/getErrorStatusCode";
import ExportService from "@/services/export.service";

class UserController {
  async register(req: Request, res: Response) {
    try {
      const userData = req.body;
      const auth = await UserService.register(userData);

      if (!auth) {
        throw new Error("User registration failed...");
      }

      const { __v, _id, password, ...userWithoutPassword } = auth.toObject();
      res.status(201).json(formatResponse(
        "success", "User registered successfully", userWithoutPassword
      ));
    } 
    catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } 
      else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new Error("Email and password are required...");
      }

      const { user, token } = await UserService.login({ email, password });
      const user_ = { 
        _id: user._id,
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role, 
        studentId: user.studentId,
        teacherId: user.teacherId,
        adminId: user.adminId,
      };

      res.status(200).json(formatResponse(
        "success", "User logged in successfully", { user_, token }
      ));
    }
    catch (error) {
      if (error instanceof Error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json(formatResponse(statusCode >= 500 ? "error" : "failed", error.message, null));
      } else {
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
      }
    }
  }

  async updateBiometricData(req: CustomRequest, res: Response) {
    try {
      const { fingerprintData, faceData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const updatedUser = await UserService.updateBiometricData(userId, {
        fingerprintData,
        faceData
      });

      res.status(200).json(formatResponse(
        "success", "Biometric data updated successfully", updatedUser
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

  async getProfile(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await UserService.getProfile(userId);
      res.status(200).json(formatResponse(
        "success", "Profile retrieved successfully", user
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

  async getUsers(req: CustomRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        throw new Error("Access denied. Only admins can view user list.");
      }

      const users = await UserService.getUsers();
      res.status(200).json(formatResponse(
        "success", "Users retrieved successfully", users
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

  async deleteUser(req: CustomRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      if (req.user?.role !== 'ADMIN') {
        throw new Error("Access denied. Only admins can delete users.");
      }

      if (req.user?.id === userId) {
        throw new Error("You cannot delete your own account.");
      }

      await UserService.deleteUser(userId);
      res.status(200).json(formatResponse(
        "success", "User deleted successfully", null
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

  async exportAllDataCsv(req: CustomRequest, res: Response) {
    try {
      if (!req.user || !["ADMIN", "TEACHER"].includes(req.user.role)) {
        throw new Error("Access denied. Only admins and teachers can export system data.");
      }

      const format = req.query.format === "xlsx" ? "xlsx" : "csv";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePrefix =
        req.user.role === "ADMIN" ? "smart-attendance-export" : "teacher-attendance-export";

      if (format === "xlsx") {
        const workbook = await ExportService.exportAllDataXlsx(req.user);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filePrefix}-${timestamp}.xlsx"`
        );
        res.status(200).send(workbook);
        return;
      }

      const csv = await ExportService.exportAllDataCsv(req.user);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filePrefix}-${timestamp}.csv"`
      );
      res.status(200).send(csv);
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

export default new UserController();
