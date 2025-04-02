const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  requestId: String,
  productName: String,
  imageUrls: String,
  status: String,
  processedImage: String,
});

module.exports = mongoose.model('Image', imageSchema);
