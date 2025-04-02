const { Queue } = require('bullmq');
const csvParser = require('csv-parser');
const { Router } = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');

const Image = require('./models/Image');
const multerConfig = require('./multerConfig');

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
          imageUrls: row['Input Image Urls'],
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

module.exports = router;
