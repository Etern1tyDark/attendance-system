import Class from "@/models/class.model";
import User from "@/models/user.model";
import Attendance from "@/models/attendance.model";
import { ClassStatus, UserRole } from "@/models/enums";

export class ClassService {
  async createClass(classData: {
    className: string;
    teacherId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    material?: string;
  }): Promise<any> {
    const teacher = await User.findById(classData.teacherId);
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      throw new Error("Invalid teacher");
    }

    if (!classData.className?.trim()) {
      throw new Error("Class name is required");
    }

    if (new Date(classData.endTime) <= new Date(classData.startTime)) {
      throw new Error("End time must be later than start time");
    }

    const totalStudents = await User.countDocuments({ role: UserRole.STUDENT });

    const newClass = new Class({
      ...classData,
      className: classData.className.trim(),
      material: classData.material?.trim() || "",
      studentCount: totalStudents,
      status: ClassStatus.EMPTY,
      teacherAttended: false,
      attendedStudentCount: 0
    });

    await newClass.save();
    return newClass.populate('teacherId', 'name email teacherId');
  }

  async updateClassMaterial(classId: string, material: string, teacherId: string): Promise<any> {
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error("Class not found");
    }

    if (classData.teacherId.toString() !== teacherId) {
      throw new Error("You can only update your own classes");
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { material: material?.trim() || "" },
      { new: true }
    ).populate('teacherId', 'name email teacherId');

    return updatedClass;
  }

  async getClasses(filters: {
    teacherId?: string;
    date?: Date;
    status?: ClassStatus;
  }): Promise<any[]> {
    const query: any = {};

    if (filters.teacherId) query.teacherId = filters.teacherId;
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (filters.status) query.status = filters.status;

    const classes = await Class.find(query)
      .populate('teacherId', 'name email teacherId')
      .sort({ date: -1, startTime: -1 });

    return classes;
  }

  async getClassById(classId: string): Promise<any> {
    const classData = await Class.findById(classId)
      .populate('teacherId', 'name email teacherId');

    if (!classData) {
      throw new Error("Class not found");
    }

    return classData;
  }

  async getClassStats(teacherId?: string): Promise<any> {
    const query: any = {};
    if (teacherId) query.teacherId = teacherId;

    const totalClasses = await Class.countDocuments(query);
    const successClasses = await Class.countDocuments({
      ...query,
      status: ClassStatus.SUCCESS
    });
    const emptyClasses = await Class.countDocuments({
      ...query,
      status: ClassStatus.EMPTY
    });

    const successRate = totalClasses > 0 ? (successClasses / totalClasses) * 100 : 0;

    return {
      totalClasses,
      successClasses,
      emptyClasses,
      successRate
    };
  }

  async updateClassStatus(): Promise<void> {
    // This method can be called periodically to update class status
    // based on teacher attendance
    const now = new Date();
    const classesToUpdate = await Class.find({
      endTime: { $lt: now },
      status: ClassStatus.EMPTY
    });

    for (const classData of classesToUpdate) {
      if (classData.teacherAttended) {
        await Class.findByIdAndUpdate(classData._id, {
          status: ClassStatus.SUCCESS
        });
      }
    }
  }

  async getClassesWithAttendance(filters: {
    teacherId?: string;
    date?: Date;
  }): Promise<any[]> {
    const classes = await this.getClasses(filters);

    // Get attendance data for each class
    const classesWithAttendance = await Promise.all(
      classes.map(async (classData) => {
        const attendance = await Attendance.find({ classId: classData._id })
          .populate('userId', 'name email role studentId');

        return {
          ...classData.toObject(),
          attendance
        };
      })
    );

    return classesWithAttendance;
  }

  async getAllClassesWithStatus(): Promise<any[]> {
    const classes = await Class.find()
      .populate('teacherId', 'name email teacherId')
      .sort({ date: -1, startTime: -1 });

    return classes.map(cls => ({
      _id: cls._id,
      className: cls.className,
      teacherId: cls.teacherId,
      date: cls.date,
      startTime: cls.startTime,
      endTime: cls.endTime,
      material: cls.material,
      status: cls.status,
      teacherAttended: cls.teacherAttended,
      studentCount: cls.studentCount,
      attendedStudentCount: cls.attendedStudentCount,
      attendanceRate: cls.studentCount > 0 ? Math.round((cls.attendedStudentCount / cls.studentCount) * 100) : 0
    }));
  }

  async deleteClass(classId: string, userId: string, userRole: string): Promise<void> {
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error("Class not found");
    }

    // Teachers can only delete their own classes, admins can delete any class
    if (userRole !== 'ADMIN' && classData.teacherId.toString() !== userId) {
      throw new Error("You can only delete your own classes");
    }

    // Delete associated attendance records
    await Attendance.deleteMany({ classId });

    // Delete the class
    await Class.findByIdAndDelete(classId);
  }
}

export default new ClassService();
