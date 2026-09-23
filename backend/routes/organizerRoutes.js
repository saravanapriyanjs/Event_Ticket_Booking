const express = require('express');
const router = express.Router();
const {
  getOrganizerEvents,
  getOrganizerDashboard,
  getEventStatistics,
  getOrganizerAnalytics,
} = require('../controllers/organizerController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all organizer routes with JWT + organizer role check
router.use(authenticateToken, authorizeRole('organizer'));

router.get('/events', getOrganizerEvents);
router.get('/dashboard', getOrganizerDashboard);
router.get('/analytics', getOrganizerAnalytics);
router.get('/events/:id/statistics', getEventStatistics);

module.exports = router;
