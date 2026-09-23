const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerOrganizer,
  loginOrganizer,
  getMe,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// USER AUTH
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// ORGANIZER AUTH
router.post('/organizer/register', registerOrganizer);
router.post('/organizer/login', loginOrganizer);

// GET CURRENT USER / ORGANIZER PROFILE
router.get('/me', authenticateToken, getMe);

module.exports = router;
