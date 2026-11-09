const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/tokens');
const User = require('../models/User');
const { loadEnv } = require('../config/env');

function getBearer(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function protect(req, res, next) {
  try {
    const token = getBearer(req) || req.cookies?.accessToken;
    if (!token) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const { jwtAccessSecret } = loadEnv();
    const decoded = verifyToken(token, jwtAccessSecret);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user || user.accountStatus !== 'active') {
      throw new AppError('Account unavailable', 401, 'UNAUTHORIZED');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'
      ? new AppError('Invalid or expired token', 401, 'UNAUTHORIZED')
      : err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = getBearer(req) || req.cookies?.accessToken;
    if (!token) return next();
    const { jwtAccessSecret } = loadEnv();
    const decoded = verifyToken(token, jwtAccessSecret);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (user && user.accountStatus === 'active') req.user = user;
  } catch {
    /* public routes tolerate bad tokens */
  }
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }
    next();
  };
}

module.exports = { protect, optionalAuth, requireRoles };
