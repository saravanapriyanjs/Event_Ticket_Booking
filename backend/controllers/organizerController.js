const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { getEventDemandPrediction } = require('../services/mlService');

// GET ORGANIZER'S CREATED EVENTS
const getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizerId: req.user.id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// GET ORGANIZER DASHBOARD METRICS SUMMARY
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const events = await Event.find({ organizerId });

    const totalEvents = events.length;
    let totalTicketsSold = 0;
    let totalAvailableTickets = 0;
    let totalRevenue = 0;

    events.forEach(evt => {
      totalTicketsSold += evt.ticketsSold;
      totalAvailableTickets += evt.availableTickets;
      totalRevenue += (evt.ticketsSold * evt.ticketPrice);
    });

    // Recent events list with fill rates
    const eventsWithStats = events.map(evt => ({
      id: evt._id,
      name: evt.name,
      category: evt.category,
      date: evt.date,
      venue: evt.venue,
      capacity: evt.capacity,
      ticketsSold: evt.ticketsSold,
      availableTickets: evt.availableTickets,
      ticketPrice: evt.ticketPrice,
      revenue: evt.ticketsSold * evt.ticketPrice,
      fillRate: evt.capacity > 0 ? ((evt.ticketsSold / evt.capacity) * 100).toFixed(1) : '0.0',
      status: evt.status,
    }));

    res.json({
      summary: {
        totalEvents,
        totalTicketsSold,
        totalAvailableTickets,
        totalRevenue,
      },
      events: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// GET DETAILED EVENT STATISTICS + ML AI PREDICTION
const getEventStatistics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Access denied to event statistics.' });
    }

    // Compute recent booking velocity (last 24 hours simulation)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const recentBookings = await Booking.find({
      eventId: event._id,
      status: 'CONFIRMED',
      createdAt: { $gte: oneDayAgo },
    });

    const bookingVelocity24h = recentBookings.reduce((sum, b) => sum + b.quantity, 0) || Math.round(event.ticketsSold * 0.15);

    // Calculate days remaining
    let daysRemaining = 10;
    try {
      const eventDate = new Date(event.date);
      if (!isNaN(eventDate.getTime())) {
        const diffTime = eventDate.getTime() - now.getTime();
        daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    } catch (e) {
      daysRemaining = 10;
    }

    // Call ML service or baseline engine
    const aiInsight = await getEventDemandPrediction({
      category: event.category,
      daysRemaining,
      capacity: event.capacity,
      ticketsSold: event.ticketsSold,
      availableTickets: event.availableTickets,
      ticketPrice: event.ticketPrice,
      bookingVelocity24h,
    });

    const totalBookingsCount = await Booking.countDocuments({ eventId: event._id, status: 'CONFIRMED' });

    res.json({
      event: {
        id: event._id,
        name: event.name,
        category: event.category,
        capacity: event.capacity,
        ticketsSold: event.ticketsSold,
        availableTickets: event.availableTickets,
        ticketPrice: event.ticketPrice,
        revenue: event.ticketsSold * event.ticketPrice,
        date: event.date,
        venue: event.venue,
        status: event.status,
      },
      stats: {
        totalBookingsCount,
        bookingVelocity24h,
        daysRemaining,
        averageBookingSize: totalBookingsCount > 0 ? (event.ticketsSold / totalBookingsCount).toFixed(1) : 0,
      },
      aiInsight,
    });
  } catch (error) {
    next(error);
  }
};

// GET AGGREGATED ORGANIZER ANALYTICS
const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const events = await Event.find({ organizerId });

    if (events.length === 0) {
      return res.json({
        summary: { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0 },
        charts: { ticketsSoldOverTime: [], revenueByCategory: [], capacityUtilization: [] },
        aiOverview: { message: 'Create events to see AI demand analytics.' }
      });
    }

    // Aggregations for Recharts
    const categoryRevenueMap = {};
    const capacityComparison = [];

    events.forEach(evt => {
      const rev = evt.ticketsSold * evt.ticketPrice;
      categoryRevenueMap[evt.category] = (categoryRevenueMap[evt.category] || 0) + rev;

      capacityComparison.push({
        name: evt.name.length > 15 ? evt.name.substring(0, 15) + '...' : evt.name,
        ticketsSold: evt.ticketsSold,
        availableTickets: evt.availableTickets,
        capacity: evt.capacity,
        fillPercentage: evt.capacity > 0 ? Math.round((evt.ticketsSold / evt.capacity) * 100) : 0,
      });
    });

    const revenueByCategory = Object.keys(categoryRevenueMap).map(cat => ({
      category: cat,
      revenue: categoryRevenueMap[cat],
    }));

    // Simulated historical timeline data for charts based on real event totals
    const ticketsSoldOverTime = [
      { date: 'Day 1', tickets: Math.round(events.reduce((s, e) => s + e.ticketsSold, 0) * 0.1) },
      { date: 'Day 2', tickets: Math.round(events.reduce((s, e) => s + e.ticketsSold, 0) * 0.25) },
      { date: 'Day 3', tickets: Math.round(events.reduce((s, e) => s + e.ticketsSold, 0) * 0.45) },
      { date: 'Day 4', tickets: Math.round(events.reduce((s, e) => s + e.ticketsSold, 0) * 0.75) },
      { date: 'Today', tickets: events.reduce((s, e) => s + e.ticketsSold, 0) },
    ];

    // Top event ML prediction for header spotlight
    const topEvent = events.reduce((prev, current) => (prev.ticketsSold > current.ticketsSold) ? prev : current, events[0]);
    const topEventAI = await getEventDemandPrediction({
      category: topEvent.category,
      daysRemaining: 12,
      capacity: topEvent.capacity,
      ticketsSold: topEvent.ticketsSold,
      availableTickets: topEvent.availableTickets,
      ticketPrice: topEvent.ticketPrice,
      bookingVelocity24h: Math.round(topEvent.ticketsSold * 0.2),
    });

    res.json({
      summary: {
        totalEvents: events.length,
        totalTicketsSold: events.reduce((s, e) => s + e.ticketsSold, 0),
        totalAvailable: events.reduce((s, e) => s + e.availableTickets, 0),
        totalRevenue: events.reduce((s, e) => s + (e.ticketsSold * e.ticketPrice), 0),
      },
      charts: {
        ticketsSoldOverTime,
        revenueByCategory,
        capacityComparison,
      },
      featuredAIInsight: {
        eventName: topEvent.name,
        eventId: topEvent._id,
        ...topEventAI,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerEvents,
  getOrganizerDashboard,
  getEventStatistics,
  getOrganizerAnalytics,
};
