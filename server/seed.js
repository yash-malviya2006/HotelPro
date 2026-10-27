require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Seed Admin User
    const adminEmail = 'admin@hotelpro.in';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash('admin@123', 10);
      admin = await User.create({
        name: 'HotelPro Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        phone: '9876543210',
        userType: 'Admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Seed Ordinary / Customer User
    const userEmail = 'testuser@gmail.com';
    let regularUser = await User.findOne({ email: userEmail });
    if (!regularUser) {
      const hashedUserPassword = await bcrypt.hash('testuser@123', 10);
      regularUser = await User.create({
        name: 'Test User',
        email: userEmail,
        password: hashedUserPassword,
        phone: '9123456780',
        userType: 'Ordinary'
      });
      console.log('Customer user created successfully');
    } else {
      console.log('Customer user already exists');
    }

    // Seed Rooms if empty
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const photo = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
      await Room.create([
        {
          roomNumber: 101,
          type: 'Deluxe King',
          rent: 4200,
          count: 3,
          description: 'A calm, light-filled retreat with a king bed, considered details and room to unwind.',
          photos: [photo('photo-1611892440504-42a792e24d32')]
        },
        {
          roomNumber: 202,
          type: 'Garden Double',
          rent: 3200,
          count: 4,
          description: 'A warm and welcoming room for slow mornings and restful evenings.',
          photos: [photo('photo-1590490360182-c33d57733427')]
        },
        {
          roomNumber: 303,
          type: 'Signature Suite',
          rent: 6800,
          count: 2,
          description: 'Extra space, refined comfort and a little more room for a special stay.',
          photos: [photo('photo-1582719508461-905c673771fd')]
        }
      ]);
      console.log('Sample rooms created successfully');
    } else {
      console.log(`Rooms already exist (${roomCount} rooms)`);
    }

    console.log('Database seeding complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
