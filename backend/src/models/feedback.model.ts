import mongoose, { Schema, type Document } from "mongoose";

export interface Feedback_ extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  rating: number; // 1-5 scale
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, {
  timestamps: true
});

// Compound index to prevent duplicate feedback per student per class
FeedbackSchema.index({ studentId: 1, classId: 1 }, { unique: true });

export default mongoose.model<Feedback_>("Feedback", FeedbackSchema);