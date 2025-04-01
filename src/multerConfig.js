import multer, { MulterError } from 'multer';

export default {
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new MulterError('LIMIT_INVALID_TYPE'));
    }

    return cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 4,
  },
  storage: multer.memoryStorage(),
};
