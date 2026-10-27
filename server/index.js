require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8001;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'HotelPro' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Internal server error.' }); });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel')
  .then(() => {
    console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
    app.listen(PORT, () => console.log(`HotelPro server running at http://localhost:${PORT}`));
  })
  .catch((error) => { console.error('MongoDB connection error:', error.message); process.exit(1); });
