import UserController from "@/controllers/user.controller";
import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.put("/biometric", authMiddleware, UserController.updateBiometricData);
router.get("/profile", authMiddleware, UserController.getProfile);
router.get("/list", authMiddleware, UserController.getUsers);
router.get("/export", authMiddleware, UserController.exportAllDataCsv);
router.get("/export/csv", authMiddleware, UserController.exportAllDataCsv);
router.delete("/:userId", authMiddleware, UserController.deleteUser);

export default router;
