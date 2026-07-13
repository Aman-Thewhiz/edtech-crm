import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const roles = ['super_admin', 'admin', 'hr_manager', 'sales_manager', 'counsellor', 'finance', 'teacher', 'student'];

export async function seedUsers() {
  for (const role of roles) {
    const email = `${role}@eduflowcrm.com`;
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({
        name: role.replaceAll('_', ' '),
        email,
        role,
        passwordHash: await bcrypt.hash('Password@123', 10),
      });
    }
  }
}