const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, userType } = req.body;
    if (!name || !email || !password || !phone || !userType) return res.status(400).json({ message: 'All fields are required.' });
    if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
    if (!['Ordinary', 'Admin'].includes(userType)) return res.status(400).json({ message: 'Invalid user type.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone, userType });
    res.status(201).json({ message: 'Account created successfully.', user: { id: user._id, name: user.name, email: user.email, phone: user.phone, userType: user.userType } });
  } catch (error) { res.status(500).json({ message: 'Unable to register user.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, userType: user.userType, phone: user.phone }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, userType: user.userType } });
  } catch { res.status(500).json({ message: 'Unable to log in.' }); }
});

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user });
});
module.exports = router;
