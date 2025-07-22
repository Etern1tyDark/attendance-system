import formatResponse from "@/utils/formatResponse";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "./auth";
import { JwtPayloadExtended } from "./auth";

export const adminMiddleware = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new Error("Access denied. No token provided...");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadExtended;
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token...");
        }
        req.user = decoded;
        if (decoded.role !== "ADMIN") {
            throw new Error("Access denied. Only admins can access this route...");
        }
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json(formatResponse("failed", error.message, null));
            return;
        }
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
    }
};

export const teacherMiddleware = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new Error("Access denied. No token provided...");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadExtended;
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token...");
        }
        req.user = decoded;
        if (decoded.role !== "TEACHER" && decoded.role !== "ADMIN") {
            throw new Error("Access denied. Only teachers and admins can access this route...");
        }
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json(formatResponse("failed", error.message, null));
            return;
        }
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
    }
};

export const studentMiddleware = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new Error("Access denied. No token provided...");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadExtended;
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token...");
        }
        req.user = decoded;
        if (decoded.role !== "STUDENT") {
            throw new Error("Access denied. Only students can access this route...");
        }
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json(formatResponse("failed", error.message, null));
            return;
        }
        res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
    }
};