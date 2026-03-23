import Feedback from "@/models/feedback.model";
import User from "@/models/user.model";
import Class from "@/models/class.model";
import { UserRole } from "@/models/enums";
import Attendance from "@/models/attendance.model";

export class FeedbackService {
  async submitFeedback(feedbackData: {
    studentId: string;
    classId: string;
    rating: number;
    comment: string;
  }): Promise<any> {
    const student = await User.findById(feedbackData.studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new Error("Invalid student");
    }

    const classData = await Class.findById(feedbackData.classId);
    if (!classData) {
      throw new Error("Class not found");
    }

    if (new Date(classData.endTime) > new Date()) {
      throw new Error("Feedback can only be submitted after the class ends");
    }

    const attendedClass = await Attendance.findOne({
      userId: feedbackData.studentId,
      classId: feedbackData.classId,
    });

    if (!attendedClass) {
      throw new Error("You can only submit feedback for classes you attended");
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      studentId: feedbackData.studentId,
      classId: feedbackData.classId
    });

    if (existingFeedback) {
      throw new Error("Feedback already submitted for this class");
    }

    const feedback = new Feedback({
      ...feedbackData,
      comment: feedbackData.comment.trim(),
    });
    await feedback.save();

    return feedback.populate(['studentId', 'classId']);
  }

  async getFeedbackByClass(classId: string): Promise<any[]> {
    const feedback = await Feedback.find({ classId })
      .populate('classId', 'className date startTime endTime')
      .sort({ createdAt: -1 });

    // Return anonymous feedback - remove student identification
    return feedback.map(f => ({
      _id: f._id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
      classId: f.classId
    }));
  }

  async getFeedbackByStudent(studentId: string): Promise<any[]> {
    const feedback = await Feedback.find({ studentId })
      .populate('studentId', 'name email studentId')
      .populate('classId', 'className date startTime endTime material')
      .sort({ createdAt: -1 });

    return feedback;
  }

  async updateFeedback(feedbackId: string, updateData: {
    rating?: number;
    comment?: string;
    studentId: string;
  }): Promise<any> {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    if (feedback.studentId.toString() !== updateData.studentId) {
      throw new Error("You can only update your own feedback");
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { 
        rating: updateData.rating,
        comment: updateData.comment?.trim()
      },
      { new: true }
    ).populate(['studentId', 'classId']);

    return updatedFeedback;
  }

  async getFeedbackStats(classId: string): Promise<any> {
    const feedback = await Feedback.find({ classId });
    
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {},
        comments: []
      };
    }

    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
    
    const ratingDistribution = feedback.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const comments = feedback.map(f => ({
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt
    }));

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      comments
    };
  }

  async getOverallFeedbackStats(teacherId?: string): Promise<any> {
    const query: any = {};
    if (teacherId) {
      // Get classes taught by this teacher
      const teacherClasses = await Class.find({ teacherId }).select('_id');
      const classIds = teacherClasses.map(c => c._id);
      query.classId = { $in: classIds };
    }

    const feedback = await Feedback.find(query);
    
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        ratingDistribution: {},
        feedbackTrends: []
      };
    }

    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback;
    
    const ratingDistribution = feedback.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution
    };
  }
}

export default new FeedbackService();
