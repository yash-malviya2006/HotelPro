const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { authenticate, adminOnly } = require('../middleware');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { roomId, fromdate, todate } = req.body;
    if (!roomId || !fromdate || !todate) return res.status(400).json({ message: 'Room and both dates are required.' });
    const start = new Date(fromdate); const end = new Date(todate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ message: 'Check-out must be after check-in.' });
    const totaldays = Math.ceil((end - start) / 86400000);
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (room.count < 1) return res.status(409).json({ message: 'This room is currently unavailable.' });
    const overlapping = await Booking.countDocuments({ roomid: room._id, status: 'booked', fromdate: { $lt: todate }, todate: { $gt: fromdate } });
    if (overlapping >= room.count) return res.status(409).json({ message: 'No rooms of this type are available for those dates.' });
    const booking = await Booking.create({ roomid: room._id, type: room.type, userid: req.user.id, username: req.user.name, fromdate, todate, totalAmount: totaldays * room.rent, totaldays, phone: req.user.phone, paymentReference: 'DEMO-' + Date.now(), status: 'booked' });
    room.currentbooking.push({ booking_id: booking._id, user_id: req.user.id, fromdate, todate, status: 'booked' });
    await room.save();
    res.status(201).json({ message: 'Booking confirmed. Demo payment recorded.', booking });
  } catch { res.status(500).json({ message: 'Unable to create booking.' }); }
});
router.get('/mine', authenticate, async (req, res) => {
  try { res.json(await Booking.find({ userid: req.user.id }).populate('roomid').sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: 'Unable to load bookings.' }); }
});
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userid: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled.' });
    booking.status = 'cancelled'; await booking.save();
    await Room.updateOne({ _id: booking.roomid }, { $pull: { currentbooking: { booking_id: booking._id } } });
    res.json({ message: 'Booking cancelled.', booking });
  } catch { res.status(400).json({ message: 'Unable to cancel booking.' }); }
});
router.get('/', authenticate, adminOnly, async (_req, res) => {
  try { res.json(await Booking.find().populate('roomid').populate('userid', 'name email phone').sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: 'Unable to load all bookings.' }); }
});
module.exports = router;
