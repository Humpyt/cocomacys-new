const express = require('express');
const router = express.Router();
const { sendContactFormMessage } = require('../email.cjs');

// POST /api/contact — submit a contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    await sendContactFormMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || '',
      message: message.trim(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again or email us directly.' });
  }
});

module.exports = router;
