const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per SRS FR-2.5
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Memory storage holds file buffers in memory for direct Cloudinary upload
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error('Only JPG and PNG images are allowed'));
    return;
  }
  cb(null, true);
}

const uploadComplaintImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 3 },
}).array('images', 3);

module.exports = { uploadComplaintImages, UPLOAD_DIR };
