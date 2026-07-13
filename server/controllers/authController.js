import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validations/authValidation.js';
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  refreshTokens,
  resetPassword,
  sendPasswordResetOtp,
} from '../services/authService.js';

function sendResponse(res, data, message = 'Success') {
  return res.json({ success: true, data, message });
}

export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400, details: error.details });
    const user = await registerUser(value);
    return sendResponse(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'User created');
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400, details: error.details });
    const { user, accessToken, refreshToken } = await loginUser(value);
    const cookieMaxAge = value.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: cookieMaxAge });
    return sendResponse(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken }, 'Logged in');
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw Object.assign(new Error('Refresh token missing'), { statusCode: 401 });
    const { user, accessToken } = await refreshTokens(token);
    return sendResponse(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken }, 'Token refreshed');
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user?.sub) await logoutUser(req.user.sub);
    res.clearCookie('refreshToken');
    return sendResponse(res, null, 'Logged out');
  } catch (error) {
    return next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400, details: error.details });
    const otp = await sendPasswordResetOtp(value.email);
    return sendResponse(res, { otp }, 'OTP generated');
  } catch (error) {
    return next(error);
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400, details: error.details });
    await resetPassword(value.email, value.otp, value.password);
    return sendResponse(res, null, 'Password reset');
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.sub);
    return sendResponse(res, { user, accessToken: req.headers.authorization?.slice(7) || null }, 'Current user');
  } catch (error) {
    return next(error);
  }
}

export async function changePasswordController(req, res, next) {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400, details: error.details });
    await changePassword(req.user.sub, value.oldPassword, value.newPassword);
    return sendResponse(res, null, 'Password changed');
  } catch (error) {
    return next(error);
  }
}