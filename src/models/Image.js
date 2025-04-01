import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  requestId: String,
  productName: String,
  imageUrls: [String],
  status: String,
  processedImage: String,
});

export default mongoose.model('Image', imageSchema);
