const Waitlist = require('../models/Waitlist');
const Event = require('../models/Event');

// JOIN WAITLIST (User Only)
const joinWaitlist = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check existing active waitlist entry
    const existing = await Waitlist.findOne({ userId, eventId, status: 'WAITING' });
    if (existing) {
      return res.status(409).json({
        message: 'You are already on the waitlist for this event.',
        waitlist: existing,
      });
    }

    // Determine current position
    const currentWaitlistCount = await Waitlist.countDocuments({ eventId, status: 'WAITING' });
    const position = currentWaitlistCount + 1;

    const waitlistEntry = await Waitlist.create({
      userId,
      eventId,
      position,
      status: 'WAITING',
    });

    res.status(201).json({
      message: `Joined waitlist successfully! Your position is #${position}`,
      waitlist: waitlistEntry,
    });
  } catch (error) {
    next(error);
  }
};

// GET WAITLIST FOR EVENT
const getWaitlistForEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const waitlist = await Waitlist.find({ eventId })
      .populate('userId', 'name email')
      .sort({ position: 1 });

    res.json({
      totalWaiting: waitlist.filter(w => w.status === 'WAITING').length,
      waitlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinWaitlist,
  getWaitlistForEvent,
};
