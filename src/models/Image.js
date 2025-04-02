const mongoose = require('mongoose');
const JobStatus = require('../constants/jobStatus');

const imageSchema = new mongoose.Schema({
  requestId: String,
  productName: String,
  imageUrls: [String],
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.PENDING,
  },
  outputUrls: [String],
});

module.exports = mongoose.model('Image', imageSchema);
