const Event = require('../models/Event');
const Organizer = require('../models/Organizer');

// GET ALL EVENTS (Public / User)
const getAllEvents = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'ACTIVE' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name organizationName email')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// GET EVENT BY ID
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name organizationName email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// CREATE EVENT (Organizer Only)
const createEvent = async (req, res, next) => {
  try {
    const { name, description, category, date, time, venue, ticketPrice, capacity, image } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Event name cannot be empty.' });
    }
    if (!description || !date || !time || !venue) {
      return res.status(400).json({ message: 'Please fill in all required event details.' });
    }
    if (ticketPrice === undefined || ticketPrice < 0) {
      return res.status(400).json({ message: 'Ticket price must be greater than or equal to 0.' });
    }
    if (!capacity || capacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be greater than 0.' });
    }

    const event = await Event.create({
      organizerId: req.user.id,
      name,
      description,
      category: category || 'Technology',
      date,
      time,
      venue,
      ticketPrice: Number(ticketPrice),
      capacity: Number(capacity),
      ticketsSold: 0,
      availableTickets: Number(capacity),
      image: image || undefined,
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE EVENT (Organizer Only - Own Event)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization check
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own events.' });
    }

    const { name, description, category, date, time, venue, ticketPrice, capacity, image, status } = req.body;

    if (name) event.name = name;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (ticketPrice !== undefined) {
      if (ticketPrice < 0) return res.status(400).json({ message: 'Ticket price cannot be negative' });
      event.ticketPrice = Number(ticketPrice);
    }
    if (capacity !== undefined) {
      if (capacity < event.ticketsSold) {
        return res.status(400).json({ message: `Capacity cannot be less than tickets already sold (${event.ticketsSold}).` });
      }
      const capacityDiff = Number(capacity) - event.capacity;
      event.capacity = Number(capacity);
      event.availableTickets = Math.max(0, event.availableTickets + capacityDiff);
    }
    if (image) event.image = image;
    if (status) event.status = status;

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE EVENT (Organizer Only - Own Event)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own events.' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
