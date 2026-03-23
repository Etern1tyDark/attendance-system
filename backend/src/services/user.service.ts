import type { User_ } from "@/models/user.model";
import User from "@/models/user.model";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { UserRole } from "@/models/enums";
import env from "@/config/env";

export class UserService {
  async register(userData: User_): Promise<User_> {
    const normalizedEmail = userData.email?.trim().toLowerCase();
    const normalizedName = userData.name?.trim();

    if (!normalizedEmail || !normalizedName || !userData.password?.trim()) {
      throw new Error("Name, email, and password are required");
    }

    if (![UserRole.STUDENT, UserRole.TEACHER].includes(userData.role)) {
      throw new Error("Invalid role selected");
    }

    if (await User.findOne({ email: normalizedEmail })) {
      throw new Error("Email already exists...");
    }

    // Generate ID based on role
    let additionalData: any = {};
    if (userData.role === UserRole.STUDENT) {
      const studentCount = await User.countDocuments({ role: UserRole.STUDENT });
      additionalData.studentId = `STU${String(studentCount + 1).padStart(6, '0')}`;
    } else if (userData.role === UserRole.TEACHER) {
      const teacherCount = await User.countDocuments({ role: UserRole.TEACHER });
      additionalData.teacherId = `TCH${String(teacherCount + 1).padStart(6, '0')}`;
    }

    const hashedPassword = await bcrypt.hash(userData.password, env.bcryptSaltRounds);
    const user = new User({ 
      ...userData, 
      ...additionalData,
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword, 
      role: userData.role
    });
    return await user.save();
  }

  async login(userData: {
    email: string;
    password: string;
  }): Promise<{ user: User_; token: string }> {
    const normalizedEmail = userData.email?.trim().toLowerCase();
    if (!normalizedEmail || !userData.password?.trim()) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new Error("User not found...");
    }

    if (!(await bcrypt.compare(userData.password, user.password))) {
      throw new Error("Wrong password!");
    }

    const token = jwt.sign(
      { username: user.name, id: user._id, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
    );

    return { user, token };
  }

  async updateBiometricData(userId: string, biometricData: {
    fingerprintData?: string;
    faceData?: string;
  }): Promise<User_> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: biometricData },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getProfile(userId: string): Promise<User_> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async verifyBiometricData(userId: string, biometricData: {
    fingerprintData?: string;
    faceData?: string;
  }): Promise<{ fingerprintMatch: boolean; faceMatch: boolean }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // For demo purposes: Accept any biometric data as valid
    // In a real system, this would do actual biometric comparison
    // We'll simulate successful verification if data is provided
    
    let fingerprintMatch = false;
    let faceMatch = false;

    if (biometricData.fingerprintData) {
      if (user.fingerprintData) {
        // User has stored fingerprint, simulate successful match for demo
        // In real system: fingerprintMatch = compareBiometricData(user.fingerprintData, biometricData.fingerprintData);
        fingerprintMatch = true; // Always true for demo
      } else {
        // User doesn't have stored fingerprint, accept any as valid for demo
        fingerprintMatch = true;
        // Store the fingerprint template for future reference
        await User.findByIdAndUpdate(userId, { fingerprintData: biometricData.fingerprintData });
      }
    }

    if (biometricData.faceData) {
      if (user.faceData) {
        // User has stored face data, simulate successful match for demo
        // In real system: faceMatch = compareBiometricData(user.faceData, biometricData.faceData);
        faceMatch = true; // Always true for demo
      } else {
        // User doesn't have stored face data, accept any as valid for demo
        faceMatch = true;
        // Store the face template for future reference
        await User.findByIdAndUpdate(userId, { faceData: biometricData.faceData });
      }
    }

    return { fingerprintMatch, faceMatch };
  }

  async getUsers(): Promise<User_[]> {
    const users = await User.find({}, { password: 0 }); // Exclude password
    return users;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === UserRole.ADMIN) {
      throw new Error("Cannot delete admin users");
    }

    await User.findByIdAndDelete(userId);
  }
}

export default new UserService();
