import mongoose, { Schema, type Document } from "mongoose";
import { ClassStatus } from "./enums";

export interface Class_ extends Document {
  className: string;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  material: string;
  status: ClassStatus;
  teacherAttended: boolean;
  studentCount: number;
  attendedStudentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema({
  className: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  material: { type: String, default: '' },
  status: { type: String, required: true, enum: Object.values(ClassStatus), default: ClassStatus.EMPTY },
  teacherAttended: { type: Boolean, default: false },
  studentCount: { type: Number, default: 0 },
  attendedStudentCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

export default mongoose.model<Class_>("Class", ClassSchema);
