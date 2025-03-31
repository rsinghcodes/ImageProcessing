import { Router } from 'express';
import uploadImageHandler from './uploadImageMiddleware';
import path from 'path';

const router = Router();

router.post('/images', uploadImageHandler, (req, res) => {
  res
    .status(200)
    .send(
      `<p>Image "${req.file.filename}" uploaded successfully.</p> <p>Access it <a href="http://localhost:3000/images/${req.file.filename}">here</a></p>`
    );
});

export default router;
