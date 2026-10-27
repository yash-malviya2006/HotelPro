const express = require('express');
const User = require('../models/User');
const { authenticate, adminOnly } = require('../middleware');
const router = express.Router();
router.get('/users', authenticate, adminOnly, async (_req, res) => {
  try { res.json(await User.find().select('-password').sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: 'Unable to load users.' }); }
});
module.exports = router;
