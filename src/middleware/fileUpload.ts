import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Allowed MIME types for CV uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Get user ID from authenticated request
    const userId = (req as any).user?.id;

    if (!userId) {
      return cb(new Error('User not authenticated'), '');
    }

    // Create user-specific directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'cvs', userId);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-randomId.ext
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomId}${ext}`;

    cb(null, filename);
  }
});

// File filter for validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('File must be PDF, DOC, or DOCX'));
  }

  cb(null, true);
};

// Configure multer
export const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Error messages mapping
export const getUploadErrorMessage = (error: any): string => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return 'File too large. Maximum 10MB allowed.';
  }
  if (error.message === 'File must be PDF, DOC, or DOCX') {
    return 'Only PDF, DOC, and DOCX files are accepted.';
  }
  return 'Upload failed. Please try again.';
};
