import { RequestHandler, Request } from 'express';
import multer from 'multer';

export const uploadSingleImage: RequestHandler = (req, res, next) => {
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, acceptFile: boolean) => void
  ) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(new Error('Invalid file format'), false);
    }
  };

  const upload = multer({
    dest: 'uploads/',
    fileFilter,
    limits: {
      files: 1,
      fileSize: 4 * 1024 * 1024 // 4MB
    }
  }).single('image');

  upload(req, res, function (err) {
    if (
      err instanceof multer.MulterError ||
      err?.message === 'Invalid file format'
    ) {
      return res.status(400).send(err.message);
    } else if (err) {
      next(err);
    }
    next();
  });
};
