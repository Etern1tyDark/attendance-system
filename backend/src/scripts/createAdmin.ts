import bcrypt from 'bcrypt';
import User from '../models/user.model';
import conn from '../db-conn';
import { UserRole } from '../models/enums';
import env from "@/config/env";

const createAdminUser = async () => {
  try {
    await conn();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    if (!env.adminEmail || !env.adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env to create the admin user');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(env.adminPassword, env.bcryptSaltRounds);
    
    const adminUser = new User({
      name: env.adminName,
      email: env.adminEmail.toLowerCase(),
      password: hashedPassword,
      role: UserRole.ADMIN,
      adminId: 'ADMIN001',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email:', env.adminEmail);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
};

createAdminUser();
