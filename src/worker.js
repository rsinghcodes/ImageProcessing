require('dotenv').config();
const axios = require('axios');
const { Worker } = require('bullmq');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { parse } = require('json2csv');
const Image = require('./models/Image');
const connect = require('./db');
const JobStatus = require('./constants/jobStatus');

const redisConnection = {
  connection: { host: 'localhost', port: 6379 },
};

async function generateCSV(imageEntries) {
  if (imageEntries.length === 0) return;

  // Prepare CSV Data
  const csvData = imageEntries.map((entry, index) => ({
    SerialNumber: index + 1,
    ProductName: entry._doc.productName,
    InputImageUrls: entry._doc.imageUrls.join(', '),
    OutputImageUrls: entry._doc.outputUrls.join(', ') || 'Processing Failed',
  }));

  // Convert JSON to CSV format
  const csv = parse(csvData, {
    fields: [
      'SerialNumber',
      'ProductName',
      'InputImageUrls',
      'OutputImageUrls',
    ],
  });

  // Define Output Path
  const outputDir = path.resolve(__dirname, 'public', 'csv');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const csvFilePath = path.join(outputDir, `${requestId}.csv`);

  // Write to File
  fs.writeFileSync(csvFilePath, csv);
  console.log(`CSV Generated: ${csvFilePath}`);
}

connect(process.env.DB_URL).then(() => {
  new Worker(
    'image-processing',
    async (job) => {
      const { requestId } = job.data;
      const entries = await Image.find({ requestId });

      for (const entry of entries) {
        const outputUrls = [];
        for (const imageUrl of entry._doc.imageUrls) {
          const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
          });

          const saveTo = path.resolve(__dirname, 'public', 'images');
          const fileName = `${uuidv4()}.jpg`;
          const outputPath = path.join(saveTo, fileName);

          await sharp(response.data).jpeg({ quality: 50 }).toFile(outputPath);
          const processedImageUrl = `http://localhost:3000/images/${fileName}`;

          outputUrls.push(processedImageUrl);
        }

        await Image.updateOne(
          { _id: entry._id },
          { $set: { status: JobStatus.COMPLETED, outputUrls: outputUrls } }
        );
      }

      await generateCSV(entries);
    },
    redisConnection
  );

  console.log('Worker is listening for jobs...');
});
