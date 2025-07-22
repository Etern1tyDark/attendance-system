import bcrypt from 'bcrypt';
import User from '../models/user.model';
import conn from '../db-conn';
import { UserRole } from '../models/enums';

const createAdminUser = async () => {
  try {
    await conn();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@smartattendance.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      adminId: 'ADMIN001',
      fingerprintData: 'admin_fingerprint_default',
      faceData: 'admin_face_default'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@smartattendance.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
};

createAdminUser();
