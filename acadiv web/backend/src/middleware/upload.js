const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { loadEnv } = require('../config/env');

const ALLOWED = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
]);

function ensureUploadDir() {
  let dir = 'uploads';
  try {
    dir = loadEnv().uploadDir;
  } catch {
    /* env may not be fully loaded in tests */
  }
  const abs = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  return abs;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureUploadDir()),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('File type not allowed'));
    }
    cb(null, true);
  },
});

module.exports = { upload };
