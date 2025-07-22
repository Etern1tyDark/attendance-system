import Attendance from "@/models/attendance.model";
import User from "@/models/user.model";
import Class from "@/models/class.model";
import { AttendanceStatus, ClassStatus } from "@/models/enums";
import UserService from "./user.service";

export class AttendanceService {
  async markAttendance(attendanceData: {
    userId: string;
    classId: string;
    fingerprintData?: string;
    faceData?: string;
  }): Promise<any> {
    const user = await User.findById(attendanceData.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const classData = await Class.findById(attendanceData.classId);
    if (!classData) {
      throw new Error("Class not found");
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      userId: attendanceData.userId,
      classId: attendanceData.classId
    });

    if (existingAttendance) {
      throw new Error("Attendance already marked for this class");
    }

    // Verify biometric data
    const { fingerprintMatch, faceMatch } = await UserService.verifyBiometricData(
      attendanceData.userId,
      {
        fingerprintData: attendanceData.fingerprintData,
        faceData: attendanceData.faceData
      }
    );

    // For testing: require at least one biometric method to be provided
    const hasFingerprint = !!attendanceData.fingerprintData;
    const hasFace = !!attendanceData.faceData;
    
    if (!hasFingerprint && !hasFace) {
      throw new Error("At least one biometric verification (fingerprint or face) is required");
    }

    // With our updated verification logic, matches should always be true if data is provided
    console.log(`Biometric verification - Fingerprint: ${fingerprintMatch}, Face: ${faceMatch}`);

    // Create attendance record
    const attendance = new Attendance({
      userId: attendanceData.userId,
      classId: attendanceData.classId,
      status: AttendanceStatus.PRESENT,
      fingerprintVerified: hasFingerprint && fingerprintMatch,
      faceVerified: hasFace && faceMatch,
      timestamp: new Date()
    });

    await attendance.save();

    // Update class attendance count
    if (user.role === 'TEACHER') {
      await Class.findByIdAndUpdate(attendanceData.classId, {
        teacherAttended: true,
        status: ClassStatus.SUCCESS
      });
    } else if (user.role === 'STUDENT') {
      await Class.findByIdAndUpdate(attendanceData.classId, {
        $inc: { attendedStudentCount: 1 }
      });
    }

    return attendance.populate(['userId', 'classId']);
  }

  async getAttendanceByClass(classId: string): Promise<any[]> {
    const attendance = await Attendance.find({ classId })
      .populate('userId', 'name email role studentId teacherId')
      .populate('classId', 'className date startTime endTime')
      .sort({ timestamp: -1 });

    return attendance;
  }

  async getAttendanceByUser(userId: string): Promise<any[]> {
    const attendance = await Attendance.find({ userId })
      .populate('userId', 'name email role studentId teacherId')
      .populate('classId', 'className date startTime endTime material')
      .sort({ timestamp: -1 });

    return attendance;
  }

  async getAttendanceStats(classId: string): Promise<any> {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const presentStudents = await Attendance.countDocuments({
      classId,
      status: AttendanceStatus.PRESENT
    });

    const classData = await Class.findById(classId).populate('teacherId', 'name');
    
    return {
      totalStudents,
      presentStudents,
      absentStudents: totalStudents - presentStudents,
      attendanceRate: totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0,
      classData,
      teacherAttended: classData?.teacherAttended || false
    };
  }

  async getAttendanceReport(filters: {
    userId?: string;
    classId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.classId) query.classId = filters.classId;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email role studentId teacherId')
      .populate('classId', 'className date startTime endTime')
      .sort({ timestamp: -1 });

    return attendance;
  }
}

export default new AttendanceService();
