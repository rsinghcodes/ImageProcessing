const axios = require('axios');
const { Worker } = require('bullmq');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Image = require('./models/Image');
const connect = require('./db');

const redisConnection = {
  connection: { host: 'localhost', port: 6379 },
};

connect('mongodb://localhost:27017/image_processing').then(() => {
  new Worker(
    'image-processing',
    async (job) => {
      const { requestId } = job.data;
      const entries = await Image.find({ requestId });

      for (const entry of entries) {
        const response = await axios({
          url: entry._doc.imageUrls,
          responseType: 'arraybuffer',
        });

        const saveTo = path.resolve(__dirname, 'public', 'images');
        const fileName = `${uuidv4()}.jpg`;
        const outputPath = path.join(saveTo, fileName);
        const publicUrl = `http://localhost:3000/images/${fileName}`;

        await sharp(response.data)
          .jpeg({ quality: 50 })
          .toFile(outputPath)
          .then(() => {
            console.log('');
          })
          .catch((err) => console.log('Error in sharp: ', err));

        await Image.updateOne(
          { _id: entry._id },
          { $set: { status: 'completed', processedImage: publicUrl } }
        );
      }
    },
    redisConnection
  );

  console.log('Worker is listening for jobs...');
});
