import axios from 'axios';
import { Worker } from 'bullmq';
import path from 'path';
import sharp from 'sharp';
import Image from './models/Image';

const redisConnection = {
  connection: { host: 'localhost', port: 6379 },
};

const imageWorker = new Worker(
  'image-processing',
  async (job) => {
    const { requestId } = job.data;
    const entries = await Image.find({ requestId });

    for (const entry of entries) {
      for (const imageUrl of entry.imageUrls) {
        const response = await axios({
          url: imageUrl,
          responseType: 'arraybuffer',
        });
        const outputPath = path.join('public', 'images', `${uuidv4()}.jpg`);
        await sharp(response.data).jpeg({ quality: 50 }).toFile(outputPath);

        await Image.updateOne(
          { _id: entry._id },
          { $set: { status: 'completed', processedImage: outputPath } }
        );
      }
    }
  },
  redisConnection
);
