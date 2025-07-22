import mongoose, { Schema, type Document } from "mongoose";
import { UserRole } from "./enums";

export interface User_ extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string; // For students
  teacherId?: string; // For teachers
  fingerprintData?: string; // Fingerprint template data
  faceData?: string; // Face recognition data
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(UserRole) },
  studentId: { type: String, sparse: true, unique: true },
  teacherId: { type: String, sparse: true, unique: true },
  fingerprintData: { type: String },
  faceData: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<User_>("User", UserSchema);