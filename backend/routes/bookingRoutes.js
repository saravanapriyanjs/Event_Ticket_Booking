const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// USER ONLY BOOKING CREATION
router.post('/', authenticateToken, authorizeRole('user'), createBooking);

// USER ONLY VIEW OWN BOOKINGS
router.get('/my', authenticateToken, authorizeRole('user'), getMyBookings);

// GET BOOKING DETAILS BY ID OR BOOKING ID
router.get('/:id', authenticateToken, getBookingById);

// CANCEL BOOKING (User Only)
router.delete('/:id', authenticateToken, authorizeRole('user'), cancelBooking);

module.exports = router;
