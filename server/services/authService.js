import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { redis } from '../config/redis.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

function refreshKey(userId) {
  return `rt:${userId}`;
}

function otpKey(email) {
  return `otp:${email}`;
}

export async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({ ...payload, passwordHash });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email, deletedAt: null, isActive: true });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, email: user.email });
  await redis.set(refreshKey(user.id), refreshToken, 'EX', 60 * 60 * 24 * 7);
  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const storedToken = await redis.get(refreshKey(payload.sub));
  if (!storedToken || storedToken !== refreshToken) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
  return { user, accessToken };
}

export async function logoutUser(userId) {
  await redis.del(refreshKey(userId));
}

export async function sendPasswordResetOtp(email) {
  const otp = '123456';
  await redis.set(otpKey(email), otp, 'EX', 600);
  return otp;
}

export async function resetPassword(email, otp, password) {
  const storedOtp = await redis.get(otpKey(email));
  if (!storedOtp || storedOtp !== otp) {
    const error = new Error('Invalid OTP');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate({ email }, { passwordHash }, { new: true });
  await redis.del(otpKey(email));
  return user;
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    const error = new Error('Old password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return user;
}

export async function getCurrentUser(userId) {
  return User.findById(userId).select('-passwordHash');
}