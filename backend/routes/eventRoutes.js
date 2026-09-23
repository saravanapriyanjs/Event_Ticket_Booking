const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { joinWaitlist, getWaitlistForEvent } = require('../controllers/waitlistController');

// PUBLIC / USER ROUTES
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// ORGANIZER ROUTES (Role: 'organizer')
router.post('/', authenticateToken, authorizeRole('organizer'), createEvent);
router.put('/:id', authenticateToken, authorizeRole('organizer'), updateEvent);
router.delete('/:id', authenticateToken, authorizeRole('organizer'), deleteEvent);

// WAITLIST NESTED ROUTES
router.post('/:id/waitlist', authenticateToken, authorizeRole('user'), joinWaitlist);
router.get('/:id/waitlist', authenticateToken, getWaitlistForEvent);

module.exports = router;
