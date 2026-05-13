const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createCircular,
  getAllCirculars,
  getAllArchivedCirculars,
  getCircularById,
  deleteCircular,
  archiveCircular,
  markCircularViewed,
  getUserViewStats,
  updateCircular,
  hideCircular,
  restoreCircular,
  getHiddenCirculars
} = require('../controllers/circularController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('application/pdf') ||
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and images allowed'), false);
    }
  }
});

router.use(protect);

// ✅ Static routes FIRST (before /:id)
router.post('/create', upload.single('file'), admin, createCircular);
router.get('/all', getAllCirculars);
router.get('/archived', getAllArchivedCirculars);
router.get('/hidden', admin, getHiddenCirculars);
router.get('/users/stats', admin, getUserViewStats);

// ✅ Dynamic routes AFTER
router.post('/:id/view', markCircularViewed);
router.put('/:id/archive', archiveCircular);
router.put('/:id/hide', admin, hideCircular);
router.put('/:id/restore', admin, restoreCircular);
router.put('/:id', admin, updateCircular);
router.get('/:id', getCircularById);
router.delete('/:id', admin, deleteCircular);

module.exports = router;