# Smart Attendance System

A comprehensive biometric-based attendance management system built with Next.js frontend and Node.js backend, featuring face recognition and fingerprint authentication for secure attendance tracking.

## 🌟 Features

### Core Functionality
- **Biometric Authentication**: Dual verification using fingerprint and face recognition
- **Role-Based Access Control**: Admin, Teacher, and Student dashboards with specific permissions
- **Real-Time Attendance**: Mark attendance with biometric verification
- **Class Management**: Create, schedule, and manage classes with materials
- **Analytics & Reports**: Track attendance statistics and success rates
- **Feedback System**: Student feedback collection and analysis

### Security & Authentication
- JWT-based authentication with secure token management
- Password hashing with bcrypt
- Role-based route protection
- Biometric template storage and verification

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Landing Page] --> B[Authentication]
        B --> C{User Role}
        C -->|Admin| D[Admin Dashboard]
        C -->|Teacher| E[Teacher Dashboard]
        C -->|Student| F[Student Dashboard]
        
        D --> G[User Management]
        D --> H[System Analytics]
        
        E --> I[Class Management]
        E --> J[Attendance Monitoring]
        
        F --> K[Mark Attendance]
        F --> L[View History]
        F --> M[Submit Feedback]
    end
    
    subgraph "Backend (Node.js/Express)"
        N[API Gateway] --> O[Authentication Middleware]
        O --> P[Role-Based Access]
        P --> Q[Controllers Layer]
        Q --> R[Services Layer]
        R --> S[Database Layer]
    end
    
    subgraph "Database (MongoDB)"
        T[(Users)]
        U[(Classes)]
        V[(Attendance)]
        W[(Feedback)]
    end
    
    F --> N
    E --> N
    D --> N
    S --> T
    S --> U
    S --> V
    S --> W
```

## 🔄 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Access System
    F->>U: Display Login Page
    
    U->>F: Enter Credentials
    F->>B: POST /user/login
    B->>DB: Verify User
    DB-->>B: User Data
    
    alt Valid Credentials
        B-->>F: JWT Token + User Info
        F->>F: Store Token in Cookie
        F->>F: Redirect to Role Dashboard
        F-->>U: Display Dashboard
    else Invalid Credentials
        B-->>F: Error Message
        F-->>U: Show Error
    end
    
    Note over F,B: Subsequent requests include JWT token
    U->>F: Access Protected Route
    F->>B: API Request with JWT
    B->>B: Verify Token
    alt Valid Token
        B-->>F: Requested Data
        F-->>U: Display Data
    else Invalid Token
        B-->>F: 401 Unauthorized
        F->>F: Redirect to Login
    end
```

## 📊 Attendance Marking Flow

```mermaid
flowchart TD
    A[Student opens Attendance Page] --> B[View Available Classes]
    B --> C[Select Class to Mark Attendance]
    C --> D[Biometric Verification Required]
    
    D --> E[Fingerprint Scan]
    E --> F{Fingerprint Valid?}
    F -->|No| G[Show Error - Try Again]
    F -->|Yes| H[Face Recognition Scan]
    
    H --> I{Face Recognition Valid?}
    I -->|No| J[Show Error - Try Again]
    I -->|Yes| K[Both Biometrics Verified]
    
    K --> L[Submit Attendance Request]
    L --> M[Backend Validates Request]
    M --> N[Check Class Timing]
    N --> O{Within Class Time?}
    
    O -->|No| P[Attendance Rejected - Wrong Time]
    O -->|Yes| Q[Mark Attendance as PRESENT]
    Q --> R[Update Statistics]
    R --> S[Send Success Response]
    S --> T[Display Success Message]
    
    G --> E
    J --> H
    P --> U[Show Error Message]
    T --> V[Refresh Attendance History]
```

## 🗄️ Database Schema

```mermaid
classDiagram
    class USER {
        +String id
        +String name
        +String email
        +String password
        +String role
        +String studentId
        +String teacherId
        +String fingerprintData
        +String faceData
        +Date createdAt
        +Date updatedAt
    }
    
    class CLASS {
        +String id
        +String className
        +String teacherId
        +Date date
        +Date startTime
        +Date endTime
        +String material
        +String status
        +Boolean teacherAttended
        +Number studentCount
        +Number attendedStudentCount
        +Date createdAt
    }
    
    class ATTENDANCE {
        +String id
        +String userId
        +String classId
        +String status
        +Boolean fingerprintVerified
        +Boolean faceVerified
        +Date timestamp
    }
    
    class FEEDBACK {
        +String id
        +String studentId
        +String classId
        +Number rating
        +String comment
        +Date createdAt
        +Date updatedAt
    }
    
    USER ||--o{ CLASS : teaches
    USER ||--o{ ATTENDANCE : attends
    USER ||--o{ FEEDBACK : provides
    CLASS ||--o{ ATTENDANCE : has
    CLASS ||--o{ FEEDBACK : receives
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendance-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   
   # Create .env file
   echo "PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key" > .env
   
   # Start development server
   pnpm dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   pnpm install
   
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
   
   # Start development server
   pnpm dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📡 API Endpoints

### Authentication
- `POST /user/register` - Register new user
- `POST /user/login` - User authentication
- `GET /user/profile` - Get user profile
- `PUT /user/biometric` - Update biometric data

### Attendance Management
- `POST /attendance/mark` - Mark attendance with biometric verification
- `GET /attendance/class/:classId` - Get class attendance records
- `GET /attendance/user` - Get user attendance history
- `GET /attendance/stats/:classId` - Get attendance statistics

### Class Management
- `POST /class` - Create new class (teachers/admins)
- `GET /class` - Get classes with filters
- `GET /class/:classId` - Get specific class details
- `PUT /class/:classId/material` - Update class material
- `GET /class/stats/:teacherId` - Get teacher's class statistics

### Feedback System
- `POST /feedback/submit` - Submit class feedback (students)
- `GET /feedback/class/:classId` - Get class feedback
- `GET /feedback/student` - Get student's feedback history
- `PUT /feedback/:feedbackId` - Update feedback

## 👥 User Roles & Permissions

### 🔑 Admin
- Full system access and user management
- View system-wide analytics and reports
- Monitor all classes and attendance
- Manage user roles and permissions

### 👨‍🏫 Teacher
- Create and manage classes
- Monitor class attendance and statistics
- Update class materials and schedules
- View student feedback for their classes

### 👨‍🎓 Student
- Mark attendance using biometric verification
- View personal attendance history and statistics
- Submit feedback for attended classes
- Update personal biometric data

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT with js-cookie
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & bcrypt
- **Validation**: Express-validator
- **CORS**: cors middleware

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Route and API endpoint protection
- **Input Validation**: Comprehensive request validation
- **Biometric Verification**: Dual-factor biometric authentication
- **CORS Protection**: Cross-origin request security

## 🏃‍♂️ Development Workflow

### Backend Development
```bash
cd backend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Frontend Development
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 📊 Business Logic

### Class Status Logic
- **SUCCESS**: Teacher attends and conducts class
- **EMPTY**: Teacher doesn't attend, class is cancelled

### Attendance Verification
- Both fingerprint AND face recognition must pass
- Attendance can only be marked during class time
- Students can only mark attendance for classes they're enrolled in

### Feedback Rules
- Students can only provide feedback for classes they attended
- Feedback includes rating (1-5) and optional comments
- Students can update their own feedback
