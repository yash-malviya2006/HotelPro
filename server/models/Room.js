const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true, unique: true },
  count: { type: Number, required: true, min: 0 },
  rent: { type: Number, required: true, min: 0 },
  type: { type: String, required: true },
  photos: { type: [String], default: [] },
  description: { type: String, required: true },
  currentbooking: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
