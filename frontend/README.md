# Smart Attendance System Frontend

A modern React-based frontend for the Smart Attendance System with role-based dashboards and biometric authentication interface.

## Features

- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Role-based Dashboards**: Separate interfaces for Admin, Teacher, and Student roles
- **Authentication**: JWT-based authentication with secure token management
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Real-time Updates**: Dynamic data updates and notifications
- **Biometric Simulation**: Interface for fingerprint and face recognition (simulated)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Authentication**: JWT with js-cookie

## Pages and Features

### Public Pages
- **Home**: Landing page with system overview
- **Login**: User authentication
- **Register**: User registration (Teacher/Student)

### Student Dashboard
- **Attendance Overview**: View attendance history and statistics
- **Mark Attendance**: Biometric attendance marking for classes
- **Class Schedule**: View today's and upcoming classes
- **Feedback**: Submit feedback for attended classes
- **Profile Management**: Update biometric data

### Teacher Dashboard
- **Class Management**: Create and manage classes
- **Attendance Monitoring**: View class attendance statistics
- **Material Updates**: Add/update class materials
- **Class Analytics**: Track success rates and student participation
- **Schedule Overview**: Manage daily class schedule

### Admin Dashboard
- **System Overview**: Complete system statistics and analytics
- **User Management**: Monitor all users (teachers and students)
- **Class Monitoring**: Oversee all classes across the system
- **Success Metrics**: Track overall system performance
- **Quick Actions**: Access to user management and system settings

## Setup Instructions

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Configuration**:
   Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Development Server**:
   ```bash
   pnpm dev
   ```
   Application will be available at `http://localhost:3001`

4. **Build for Production**:
   ```bash
   pnpm build
   pnpm start
   ```

## Authentication Flow

1. **Registration**: Users select role (Teacher/Student) and create account
2. **Login**: Email/password authentication receives JWT token
3. **Dashboard Redirect**: Automatic redirect based on user role
4. **Token Management**: Automatic token refresh and secure storage
5. **Role-based Access**: Route protection based on user permissions

## Biometric Features

- **Fingerprint Simulation**: Mock fingerprint data for demonstration
- **Face Recognition Simulation**: Mock face data for demonstration
- **Dual Verification**: Both biometric factors required for attendance
- **Biometric Setup**: Users can update their biometric templates

## Key Components

### Authentication
- JWT token management with automatic refresh
- Role-based route protection
- Secure cookie storage for tokens and user data

### Dashboards
- Real-time data fetching and updates
- Interactive charts and statistics
- Responsive card-based layouts

### Forms
- Form validation with React Hook Form
- Error handling and user feedback
- Accessibility-focused form design

### UI Components
- Consistent design system with Tailwind CSS
- Interactive buttons and navigation
- Loading states and error boundaries

## API Integration

The frontend integrates with the backend REST API:

- **User Management**: Registration, login, profile updates
- **Attendance**: Mark attendance, view history, statistics
- **Classes**: Create, manage, view class information
- **Feedback**: Submit and view class feedback

## Development Guidelines

### Code Structure
- Pages in `src/app/` following Next.js App Router
- Reusable utilities in `src/lib/`
- Type definitions centralized in `src/lib/types.ts`
- API calls organized by feature in `src/lib/types.ts`

### Styling
- Tailwind CSS for all styling
- Consistent color scheme and spacing
- Mobile-first responsive design
- Accessible color contrasts and focus states

### State Management
- React Hooks for local state
- Context API for global auth state (via cookies)
- Optimistic updates for better UX

## Future Enhancements

- Real biometric integration with hardware
- Progressive Web App (PWA) features
- Advanced analytics and reporting
- Real-time notifications
- Multi-language support