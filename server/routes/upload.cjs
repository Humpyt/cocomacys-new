const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const requireAuth = require('../middleware/requireAuth.cjs');

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// POST upload single image
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST upload multiple images
router.post('/multiple', requireAuth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const urls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));
    res.json({ files: urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// DELETE uploaded image
router.delete('/:filename', requireAuth, (req, res) => {
  try {
    const fs = require('fs');
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../../uploads', filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
