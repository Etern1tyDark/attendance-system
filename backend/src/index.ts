// src/index.ts
import express, { Express, Request, Response } from "express";
import connDB from "@/db-conn";
import cors from "cors";
import userRoutes from "@/router/user.router";
import attendanceRoutes from "@/router/attendance.router";
import classRoutes from "@/router/class.router";
import feedbackRoutes from "@/router/feedback.router";
import formatResponse from "@/utils/formatResponse";
import env from "@/config/env";

const app: Express = express();
const port = env.port;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.clientUrl) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

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
