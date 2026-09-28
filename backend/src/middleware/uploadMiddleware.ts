/**
 * middleware/uploadMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/middleware/uploadMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   File upload middleware using standard Multer disk storage.
 *   Uploaded files are stored in the server's local 'uploads/' folder.
 *   MongoDB stores ONLY the path/reference string (e.g. '/uploads/pet-123.jpg').
 *   Images are completely optional: if no file is provided, req.file is undefined.
 * ─────────────────────────────────────────────────────────────
 */

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// File type filter: accept only image formats
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * Upload a single image file optionally.
 * If no file is attached, request continues normally with req.file = undefined.
 * @param fieldName - The multipart form field name (e.g. 'image', 'photo')
 */
export const uploadSingle = (fieldName: string): ReturnType<typeof upload.single> =>
  upload.single(fieldName);
