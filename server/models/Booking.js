const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomid: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  type: { type: String, required: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  username: { type: String, required: true },
  fromdate: { type: String, required: true },
  todate: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  totaldays: { type: Number, required: true },
  phone: { type: String, required: true },
  // Payment is represented by a provider/reference in this app; never store CVV or raw card data in production.
  paymentReference: { type: String, default: 'DEMO-PAYMENT' },
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
