const express = require('express');
const Room = require('../models/Room');
const { authenticate, adminOnly } = require('../middleware');
const router = express.Router();

router.get('/', async (_req, res) => {
  try { res.json(await Room.find().sort({ roomNumber: 1 })); }
  catch { res.status(500).json({ message: 'Unable to load rooms.' }); }
});
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { roomNumber, count, rent, type, photos, description } = req.body;
    if (roomNumber === undefined || count === undefined || rent === undefined || !type || !description) return res.status(400).json({ message: 'Please complete all required room fields.' });
    const room = await Room.create({ roomNumber: Number(roomNumber), count: Number(count), rent: Number(rent), type, photos: Array.isArray(photos) ? photos : (photos ? [photos] : []), description });
    res.status(201).json(room);
  } catch (error) { res.status(400).json({ message: error.code === 11000 ? 'Room number already exists.' : 'Unable to add room.' }); }
});
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const active = await require('../models/Booking').exists({ roomid: req.params.id, status: 'booked' });
    if (active) return res.status(409).json({ message: 'Room has active bookings and cannot be deleted.' });
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room deleted.' });
  } catch { res.status(400).json({ message: 'Invalid room.' }); }
});
module.exports = router;
