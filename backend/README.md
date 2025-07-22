# pweb-express-mongodb-P05-2024

## Initial Setup

**NOTE: # Smart Attendance System Backend

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
   npm install
   ```

2. Create `.env` file:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

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
- Input validation and sanitization**

Install dependencies with:

```
yarn install
```

Run dev server with:

```
yarn run dev
```

**Setting .env**

Create an .env file based on `.env.example`.

```
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
JWT_SECRET=""
```

- MONGODB_URI can be obtained by going into MongoDB Atlas > Connect > Drivers (Use v5.5 stable API)

- JWT_SECRET can be anything, like `qwertyuiopasdfghjklzxcvbnm`

## Development Flow

Create model (schema) > service > controller > router

## API Endpoints

### Authentication

- **User register**

`POST {{BASE_URL}}/auth/register`

Params

```
username: string;
email: string;
password: string;
```

- **User login**

`POST {{BASE_URL}}/auth/login`

Params

```
email: string;
password: string;
```

### Books (WIP)

- Get All Books

`GET {{BASE_URL}}/book`

- Get Book by ID

`GET {{BASE_URL}}/book/:id`

- Add New Book

`POST {{BASE_URL}}/book`

- Modify Book Data

`PATCH {{BASE_URL}}/book/:id`

- Remove Book

`DELETE {{BASE_URL}}/book/:id`

### Mechanism (WIP)

- Borrow a Book

`POST {{BASE_URL}}/mechanism/borrow/:id`

- Return a Book

`POST {{BASE_URL}}/mechanism/return/:id`

### Misc

Health Check

`GET {{BASE_URL}}/`