const express = require('express');
const router = express.Router();
const { registerUser, authUser, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, require('../controllers/authController').updateProfile);

module.exports = router;
