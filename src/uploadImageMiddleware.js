import path from 'path';
import multer from 'multer';
import multerConfig from './multerConfig';
import sharp from 'sharp';

export default (req, res, next) => {
  const upload = multer(multerConfig).single('image');

  upload(req, res, async (err) => {
    if (err) {
      try {
        switch (err.code) {
          case 'LIMIT_INVALID_TYPE':
            throw new Error('Invalid file type! Only PNG and JPEG are allowed');

          case 'LIMIT_FILE_SIZE':
            throw new Error('File size is too large! Max size is 2MB');

          default:
            throw new Error('Something went wrong!');
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
        return;
      }
    }

    try {
      const filename = `${Date.now()}${path.extname(req.file.originalname)}`;
      const saveTo = path.resolve(__dirname, 'public', 'images');
      const filePath = path.join(saveTo, filename);

      await sharp(req.file.buffer)
        .resize({ width: 300, height: 300 })
        .jpeg({ quality: 30 })
        .toFile(filePath);

      req.file.filename = filename;

      next();
    } catch (err) {
      res.status(400).json({ message: err.message });
      return;
    }
  });
};
