import { Queue } from 'bullmq';
import csvParser from 'csv-parser';
import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import Image from './models/Image';
import multerConfig from './multerConfig';

import { Readable } from 'stream';

const router = Router();
const upload = multer(multerConfig);

const imageQueue = new Queue('image-processing', {
  connection: { host: 'localhost', port: 6379 },
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const requestId = uuidv4();
    const results = [];

    const stream = Readable.from(req.file.buffer.toString());
    stream
      .pipe(csvParser())
      .on('data', (row) => {
        if (!row['Product Name'] || !row['Input Image Urls']) return;
        results.push({
          requestId,
          productName: row['Product Name'],
          imageUrls: row['Input Image Urls'].split(','),
          status: 'pending',
        });
      })
      .on('end', async () => {
        await Image.insertMany(results);
        await imageQueue.add('image-processing', { requestId });
        res.json({ requestId, message: 'Processing started' });
      });
  } catch (error) {
    console.log('Error: ==>>', error);
  }
});

router.get('/status/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const data = await Image.find({ requestId });
  res.json(data);
});

export default router;
