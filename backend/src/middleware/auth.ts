import formatResponse from "@/utils/formatResponse";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayloadExtended extends jwt.JwtPayload {
  id: string;
  role: string;
}

export interface CustomRequest extends Request {
  user?: JwtPayloadExtended;
}

export const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json(formatResponse("failed", "Access denied. No token provided...", null));
      return; // Return early to prevent next() from being called
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayloadExtended;
    if (!decoded || !decoded.id) {
      res.status(401).json(formatResponse("failed", "Invalid token...", null));
      return; // Return early to prevent next() from being called
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(formatResponse("failed", "Invalid token format or signature", null));
      return;
    }
    
    // Handle other errors
    if (error instanceof Error) {
      res.status(401).json(formatResponse("failed", error.message, null));
      return;
    }
    
    // Handle unknown errors
    res.status(500).json(formatResponse("error", "An unknown error occurred.", null));
    return;
  }
};
