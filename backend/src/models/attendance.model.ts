import mongoose, { Schema, type Document } from "mongoose";
import { AttendanceStatus } from "./enums";

export interface Attendance_ extends Document {
  userId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  fingerprintVerified: boolean;
  faceVerified: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  status: { type: String, required: true, enum: Object.values(AttendanceStatus) },
  fingerprintVerified: { type: Boolean, default: false },
  faceVerified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
AttendanceSchema.index({ userId: 1, classId: 1 }, { unique: true });

export default mongoose.model<Attendance_>("Attendance", AttendanceSchema);
