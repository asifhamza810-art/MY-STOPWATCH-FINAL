const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created } = require('../utils/apiResponse');
const { loadEnv } = require('../config/env');
const { signAccessToken, signRefreshToken, verifyToken, hashToken } = require('../utils/tokens');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UserPreferences = require('../models/UserPreferences');
const AuthSession = require('../models/AuthSession');

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    accountStatus: user.accountStatus,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

async function issueTokens(user, req) {
  const env = loadEnv();
  const accessToken = signAccessToken(
    { sub: String(user._id), role: user.role },
    env.jwtAccessSecret,
    env.jwtAccessExpires
  );
  const refreshToken = signRefreshToken(
    { sub: String(user._id), type: 'refresh' },
    env.jwtRefreshSecret,
    env.jwtRefreshExpires
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await AuthSession.create({
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: req.get('user-agent')?.slice(0, 300),
  });
  return { accessToken, refreshToken };
}

exports.register = asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password || !displayName) {
    throw new AppError('email, password, and displayName are required', 400, 'VALIDATION_ERROR');
  }
  if (String(password).length < 8) {
    throw new AppError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
  }
  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) throw new AppError('Email already registered', 409, 'DUPLICATE');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: String(email).toLowerCase().trim(),
    passwordHash,
    displayName: String(displayName).trim(),
  });
  await StudentProfile.create({ userId: user._id, preferredName: displayName });
  await UserPreferences.create({ userId: user._id });

  const tokens = await issueTokens(user, req);
  created(res, { user: publicUser(user), ...tokens });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError('email and password are required', 400, 'VALIDATION_ERROR');
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  if (user.accountStatus !== 'active') throw new AppError('Account unavailable', 403, 'FORBIDDEN');
  user.lastLoginAt = new Date();
  await user.save();
  const tokens = await issueTokens(user, req);
  ok(res, { user: publicUser(user), ...tokens });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) throw new AppError('refreshToken required', 400, 'VALIDATION_ERROR');
  const env = loadEnv();
  let decoded;
  try {
    decoded = verifyToken(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
  }
  const session = await AuthSession.findOne({
    refreshTokenHash: hashToken(refreshToken),
    revokedAt: null,
  });
  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Refresh session expired', 401, 'UNAUTHORIZED');
  }
  const user = await User.findById(decoded.sub);
  if (!user || user.accountStatus !== 'active') throw new AppError('Account unavailable', 401, 'UNAUTHORIZED');
  session.revokedAt = new Date();
  await session.save();
  const tokens = await issueTokens(user, req);
  ok(res, { user: publicUser(user), ...tokens });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    await AuthSession.updateOne(
      { refreshTokenHash: hashToken(refreshToken) },
      { $set: { revokedAt: new Date() } }
    );
  }
  ok(res, { loggedOut: true });
});

exports.me = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const preferences = await UserPreferences.findOne({ userId: req.user._id });
  ok(res, { user: publicUser(req.user), profile, preferences });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Revoke all auth sessions
  await AuthSession.deleteMany({ userId });

  // Remove student profile & user preferences
  await Promise.all([
    StudentProfile.deleteMany({ userId }),
    UserPreferences.deleteMany({ userId }),
  ]);

  // Remove student artifacts & portfolios
  const Artifact = require('../models/Artifact');
  const { Portfolio, PortfolioShare } = require('../models/Portfolio');
  const { StudentRoadmap } = require('../models/Career');
  const { StudentSkill, SkillGapAssessment } = require('../models/Skill');
  const { AssessmentSession, AssessmentResult } = require('../models/Assessment');

  await Promise.all([
    Artifact.deleteMany({ userId }),
    Portfolio.deleteMany({ userId }),
    PortfolioShare.deleteMany({ userId }),
    StudentRoadmap.deleteMany({ userId }),
    StudentSkill.deleteMany({ userId }),
    SkillGapAssessment.deleteMany({ userId }),
    AssessmentSession.deleteMany({ userId }),
    AssessmentResult.deleteMany({ userId }),
  ]);

  // Delete primary user record
  await User.findByIdAndDelete(userId);

  ok(res, {
    deleted: true,
    message: 'Your account and all associated student records have been permanently erased.',
  });
});

