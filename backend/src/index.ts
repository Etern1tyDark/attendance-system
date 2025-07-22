// src/index.ts
import express, { Express, Request, Response } from "express";
import connDB from "@/db-conn";
import cors from "cors";
import userRoutes from "@/router/user.router";
import attendanceRoutes from "@/router/attendance.router";
import classRoutes from "@/router/class.router";
import feedbackRoutes from "@/router/feedback.router";
import formatResponse from "@/utils/formatResponse";

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// mongodb atlas connection
connDB();

app.get("/", (req: Request, res: Response) => {
  const date = new Date().toLocaleString();
  const response = formatResponse("success", "Smart Attendance System API", {
    timestamp: date,
    version: "1.0.0",
    endpoints: {
      users: "/user",
      attendance: "/attendance",
      classes: "/class",
      feedback: "/feedback"
    }
  });
  res.send(response);
});

// routers
app.use('/user', userRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/class', classRoutes);
app.use('/feedback', feedbackRoutes);

app.listen(port, () => {
  console.log(`[server]: Smart Attendance System API running at http://localhost:${port}`);
});