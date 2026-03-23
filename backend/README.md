# Smart Attendance System Backend

A comprehensive backend API for a smart attendance system that uses biometric authentication (fingerprint and face recognition) to mark attendance.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Roles**: Admin, Teacher, and Student roles with different permissions
- **Biometric Authentication**: Fingerprint and face recognition integration
- **Attendance Management**: Mark attendance using biometric verification
- **Class Management**: Teachers can create classes and manage materials
- **Feedback System**: Students can provide feedback on classes
- **Analytics**: Track attendance statistics and success rates

## API Endpoints

### Authentication
- `POST /user/register` - Register new user (admin/teacher/student)
- `POST /user/login` - Login user
- `GET /user/profile` - Get user profile (authenticated)
- `PUT /user/biometric` - Update biometric data (authenticated)

### Attendance
- `POST /attendance/mark` - Mark attendance with biometric verification
- `GET /attendance/class/:classId` - Get attendance for a specific class
- `GET /attendance/user` - Get attendance history for logged-in user
- `GET /attendance/stats/:classId` - Get attendance statistics for a class

### Class Management
- `POST /class` - Create new class (teachers/admins only)
- `GET /class` - Get classes (with optional filters)
- `GET /class/:classId` - Get specific class details
- `PUT /class/:classId/material` - Update class material (teachers/admins only)
- `GET /class/stats/:teacherId` - Get class statistics for a teacher

### Feedback
- `POST /feedback/submit` - Submit feedback for a class (students only)
- `GET /feedback/class/:classId` - Get feedback for a specific class
- `GET /feedback/student` - Get feedback submitted by logged-in student
- `PUT /feedback/:feedbackId` - Update feedback (students can only update their own)

## Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: Enum (ADMIN, TEACHER, STUDENT)
- `studentId`: String (auto-generated for students)
- `teacherId`: String (auto-generated for teachers)
- `fingerprintData`: String (biometric template)
- `faceData`: String (biometric template)

### Class Model
- `className`: String (required)
- `teacherId`: ObjectId (reference to User)
- `date`: Date (required)
- `startTime`: Date (required)
- `endTime`: Date (required)
- `material`: String (class material/notes)
- `status`: Enum (SUCCESS, EMPTY)
- `teacherAttended`: Boolean
- `studentCount`: Number
- `attendedStudentCount`: Number

### Attendance Model
- `userId`: ObjectId (reference to User)
- `classId`: ObjectId (reference to Class)
- `status`: Enum (PRESENT, ABSENT)
- `fingerprintVerified`: Boolean
- `faceVerified`: Boolean
- `timestamp`: Date

### Feedback Model
- `studentId`: ObjectId (reference to User)
- `classId`: ObjectId (reference to Class)
- `rating`: Number (1-5 scale)
- `comment`: String
- `createdAt`: Date
- `updatedAt`: Date

## Setup Instructions

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create `.env` file:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

4. **Build for Production**:
   ```bash
   pnpm build
   pnpm start
   ```

## Deploy on Render

This repo includes a Render blueprint at `../render.yaml` for the backend service.

### Option 1: Blueprint deploy
1. Push the repository to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select this repository.
4. Render will detect `render.yaml` and create the backend service using:
   - `rootDir`: `backend`
   - `buildCommand`: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
   - `startCommand`: `pnpm start`
5. Set these environment variables in Render before the first deploy:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

### Option 2: Manual web service
If you prefer not to use the blueprint, create a **Web Service** in Render with:

- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- Start Command: `pnpm start`
- Health Check Path: `/`

### Recommended production values
- `NODE_ENV=production`
- `JWT_EXPIRES_IN=1h`
- `BCRYPT_SALT_ROUNDS=10`
- `CLIENT_URL=<your deployed frontend URL>`

### After deployment
- Use the Render service URL as the frontend's `NEXT_PUBLIC_API_URL`.
- Keep MongoDB hosted somewhere reachable from Render, such as MongoDB Atlas.

## Authentication Flow

1. **Registration**: Users register with role selection (TEACHER/STUDENT)
2. **Login**: Users authenticate with email/password to receive JWT token
3. **Biometric Setup**: Users upload fingerprint and face data
4. **Attendance**: Users mark attendance by verifying both biometric factors

## Business Logic

- **Class Status**: Classes are marked as "SUCCESS" if teacher attends, "EMPTY" if teacher doesn't attend
- **Attendance Verification**: Both fingerprint and face verification must pass for attendance to be marked
- **Feedback**: Only students can submit feedback, and only for classes they attended
- **Statistics**: Track success rates, attendance rates, and feedback analytics

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Biometric verification (basic implementation)
- Input validation and sanitization
