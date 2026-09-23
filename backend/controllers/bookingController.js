const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { broadcastCapacityUpdate } = require('../services/socketService');

/**
 * Generate unique human-readable Booking ID (e.g., EVT-2026-A7F82K)
 */
const generateBookingId = () => {
  const year = new Date().getFullYear();
  const randomSuffix = uuidv4().substring(0, 6).toUpperCase();
  return `EVT-${year}-${randomSuffix}`;
};

// CREATE BOOKING (User Only) - Concurrency-Safe
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession().catch(() => null);
  if (session) session.startTransaction();

  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    // 1. Fetch Event first to verify status and price
    const event = await Event.findById(eventId).session(session || null);
    if (!event) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.status !== 'ACTIVE') {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Event is not active for bookings.' });
    }

    if (event.availableTickets < qty) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        message: `SOLD OUT / INSUFFICIENT CAPACITY. Requested ${qty} tickets, but only ${event.availableTickets} available.`,
        availableTickets: event.availableTickets,
      });
    }

    // 2. ATOMIC CONDITIONAL UPDATE: Ensure availableTickets >= qty at database execution instant
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'ACTIVE',
        availableTickets: { $gte: qty },
      },
      {
        $inc: {
          availableTickets: -qty,
          ticketsSold: qty,
        },
      },
      {
        new: true,
        session: session || null,
      }
    );

    // If updatedEvent is null, race condition occurred or tickets exhausted
    if (!updatedEvent) {
      if (session) await session.abortTransaction();
      return res.status(400).json({
        message: 'Booking failed: Tickets were just sold out by another user. Please try again.',
        availableTickets: 0,
      });
    }

    // 3. Compute Total Amount & Booking ID
    const totalAmount = qty * updatedEvent.ticketPrice;
    const bookingId = generateBookingId();

    // 4. Generate Digital Ticket QR Code Payload
    const qrPayload = JSON.stringify({
      bookingId,
      eventId: updatedEvent._id,
      eventName: updatedEvent.name,
      userId,
      quantity: qty,
      totalAmount,
      issuedAt: new Date().toISOString(),
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload).catch(() => '');

    // 5. Create Booking Document
    const booking = await Booking.create(
      [
        {
          bookingId,
          userId,
          eventId: updatedEvent._id,
          quantity: qty,
          totalAmount,
          status: 'CONFIRMED',
          qrCode: qrCodeDataUrl,
        },
      ],
      { session: session || null }
    );

    if (session) await session.commitTransaction();

    // 6. Real-time broadcast via Socket.IO
    broadcastCapacityUpdate(eventId, updatedEvent.availableTickets, updatedEvent.ticketsSold);

    const createdBooking = Array.isArray(booking) ? booking[0] : booking;

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: {
        bookingId: createdBooking.bookingId,
        id: createdBooking._id,
        eventId: updatedEvent._id,
        eventName: updatedEvent.name,
        venue: updatedEvent.venue,
        date: updatedEvent.date,
        time: updatedEvent.time,
        quantity: createdBooking.quantity,
        totalAmount: createdBooking.totalAmount,
        status: createdBooking.status,
        qrCode: createdBooking.qrCode,
        createdAt: createdBooking.createdAt,
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

// GET USER'S BOOKINGS
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('eventId', 'name description date time venue ticketPrice capacity availableTickets image status')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// GET BOOKING BY ID
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
    }).populate('eventId').populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Guard access
    if (req.user.role === 'user' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot view another user\'s booking.' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// CANCEL BOOKING (User Only) - Atomically Restores Capacity
const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession().catch(() => null);
  if (session) session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session || null);
    if (!booking) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.user.id) {
      if (session) await session.abortTransaction();
      return res.status(403).json({ message: 'Forbidden: You can only cancel your own bookings.' });
    }

    if (booking.status === 'CANCELLED') {
      if (session) await session.abortTransaction();
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // 1. Mark Booking as CANCELLED
    booking.status = 'CANCELLED';
    await booking.save({ session: session || null });

    // 2. ATOMICALLY RESTORE CAPACITY on Event
    const updatedEvent = await Event.findByIdAndUpdate(
      booking.eventId,
      {
        $inc: {
          availableTickets: booking.quantity,
          ticketsSold: -booking.quantity,
        },
      },
      { new: true, session: session || null }
    );

    if (session) await session.commitTransaction();

    // 3. Broadcast real-time capacity restoration
    if (updatedEvent) {
      broadcastCapacityUpdate(booking.eventId, updatedEvent.availableTickets, updatedEvent.ticketsSold);
    }

    res.json({
      message: 'Booking cancelled successfully. Capacity restored.',
      bookingId: booking.bookingId,
      restoredQuantity: booking.quantity,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    next(error);
  } finally {
    if (session) session.endSession();
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
