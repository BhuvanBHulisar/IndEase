import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import { uploadVideo } from '../middleware/upload.js';

const router = express.Router();

// POST /api/upload/video
router.post('/video', auth, (req, res) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    res.json({ success: true, videoUrl, filename: req.file.filename });
  });
});

export default router;
