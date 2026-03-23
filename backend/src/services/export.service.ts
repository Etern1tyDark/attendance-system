import Attendance from "@/models/attendance.model";
import Class from "@/models/class.model";
import Feedback from "@/models/feedback.model";
import User from "@/models/user.model";
import toCsv from "@/utils/csv";
import * as XLSX from "xlsx";

const toId = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && "toString" in value) {
    return value.toString();
  }

  return "";
};

export class ExportService {
  private async buildExportRows(requester?: { id: string; role: string }): Promise<Array<Record<string, unknown>>> {
    const isTeacherExport = requester?.role === "TEACHER";

    const classes = await Class.find(
      isTeacherExport ? { teacherId: requester.id } : {}
    )
      .populate("teacherId", "name email teacherId")
      .sort({ date: -1, startTime: -1 })
      .lean();

    const classIds = classes.map((classData) => classData._id);

    const attendanceQuery = isTeacherExport ? { classId: { $in: classIds } } : {};
    const feedbackQuery = isTeacherExport ? { classId: { $in: classIds } } : {};

    const [attendanceRecords, feedbackRecords] = await Promise.all([
      Attendance.find(attendanceQuery)
        .populate("userId", "name email role studentId teacherId adminId")
        .populate("classId", "className date startTime endTime")
        .sort({ timestamp: -1 })
        .lean(),
      Feedback.find(feedbackQuery)
        .populate("studentId", "name email studentId")
        .populate("classId", "className date startTime endTime")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const users = isTeacherExport
      ? await User.find(
          {
            _id: {
              $in: Array.from(
                new Set([
                  requester?.id,
                  ...attendanceRecords.map((record) =>
                    typeof record.userId === "object" && record.userId !== null && "_id" in record.userId
                      ? toId(record.userId._id)
                      : toId(record.userId)
                  ),
                  ...feedbackRecords.map((record) =>
                    typeof record.studentId === "object" && record.studentId !== null && "_id" in record.studentId
                      ? toId(record.studentId._id)
                      : toId(record.studentId)
                  ),
                ].filter(Boolean))
              ),
            },
          },
          { password: 0 }
        )
          .sort({ createdAt: -1 })
          .lean()
      : await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();

    return [
      ...users.map((user) => ({
        recordType: "user",
        id: toId(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        teacherId: user.teacherId,
        adminId: user.adminId,
        userCreatedAt: user.createdAt,
        userUpdatedAt: user.updatedAt,
      })),
      ...classes.map((classData) => ({
        recordType: "class",
        id: toId(classData._id),
        className: classData.className,
        teacherUserId:
          typeof classData.teacherId === "object" && classData.teacherId !== null && "_id" in classData.teacherId
            ? toId(classData.teacherId._id)
            : toId(classData.teacherId),
        teacherName:
          typeof classData.teacherId === "object" && classData.teacherId !== null && "name" in classData.teacherId
            ? classData.teacherId.name
            : "",
        teacherEmail:
          typeof classData.teacherId === "object" && classData.teacherId !== null && "email" in classData.teacherId
            ? classData.teacherId.email
            : "",
        classDate: classData.date,
        startTime: classData.startTime,
        endTime: classData.endTime,
        material: classData.material,
        classStatus: classData.status,
        teacherAttended: classData.teacherAttended,
        studentCount: classData.studentCount,
        attendedStudentCount: classData.attendedStudentCount,
        classCreatedAt: classData.createdAt,
        classUpdatedAt: classData.updatedAt,
      })),
      ...attendanceRecords.map((attendance) => ({
        recordType: "attendance",
        id: toId(attendance._id),
        attendanceStatus: attendance.status,
        attendanceTimestamp: attendance.timestamp,
        fingerprintVerified: attendance.fingerprintVerified,
        faceVerified: attendance.faceVerified,
        userId:
          typeof attendance.userId === "object" && attendance.userId !== null && "_id" in attendance.userId
            ? toId(attendance.userId._id)
            : toId(attendance.userId),
        userName:
          typeof attendance.userId === "object" && attendance.userId !== null && "name" in attendance.userId
            ? attendance.userId.name
            : "",
        userEmail:
          typeof attendance.userId === "object" && attendance.userId !== null && "email" in attendance.userId
            ? attendance.userId.email
            : "",
        classId:
          typeof attendance.classId === "object" && attendance.classId !== null && "_id" in attendance.classId
            ? toId(attendance.classId._id)
            : toId(attendance.classId),
        className:
          typeof attendance.classId === "object" && attendance.classId !== null && "className" in attendance.classId
            ? attendance.classId.className
            : "",
        attendanceCreatedAt: attendance.createdAt,
        attendanceUpdatedAt: attendance.updatedAt,
      })),
      ...feedbackRecords.map((feedback) => ({
        recordType: "feedback",
        id: toId(feedback._id),
        rating: feedback.rating,
        comment: feedback.comment,
        studentId:
          typeof feedback.studentId === "object" && feedback.studentId !== null && "_id" in feedback.studentId
            ? toId(feedback.studentId._id)
            : toId(feedback.studentId),
        studentName:
          typeof feedback.studentId === "object" && feedback.studentId !== null && "name" in feedback.studentId
            ? feedback.studentId.name
            : "",
        studentEmail:
          typeof feedback.studentId === "object" && feedback.studentId !== null && "email" in feedback.studentId
            ? feedback.studentId.email
            : "",
        classId:
          typeof feedback.classId === "object" && feedback.classId !== null && "_id" in feedback.classId
            ? toId(feedback.classId._id)
            : toId(feedback.classId),
        className:
          typeof feedback.classId === "object" && feedback.classId !== null && "className" in feedback.classId
            ? feedback.classId.className
            : "",
        feedbackCreatedAt: feedback.createdAt,
        feedbackUpdatedAt: feedback.updatedAt,
      })),
    ];
  }

  async exportAllDataCsv(requester?: { id: string; role: string }): Promise<string> {
    const rows = await this.buildExportRows(requester);
    return toCsv(rows);
  }

  async exportAllDataXlsx(requester?: { id: string; role: string }): Promise<Buffer> {
    const rows = await this.buildExportRows(requester);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "AttendanceData");

    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;
  }
}

export default new ExportService();
