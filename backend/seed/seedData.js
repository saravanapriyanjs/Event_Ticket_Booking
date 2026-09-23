const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const QRCode = require('qrcode');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Waitlist = require('../models/Waitlist');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventiq';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    } catch (err) {
      console.warn(`[Seed Warning]: Local MongoDB not running (${err.message}). Using MongoMemoryServer...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
    }

    // Clear existing collection data
    await User.deleteMany({});
    await Organizer.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    await Waitlist.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // Passwords hash
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    // 1. Create Default Organizer
    const organizer = await Organizer.create({
      name: 'Sarah Connor',
      email: 'organizer@eventiq.com',
      password: defaultPasswordHash,
      organizationName: 'TechEvents Global Inc.',
      role: 'organizer',
    });

    // 2. Create Default Users
    const user1 = await User.create({
      name: 'Alex Johnson',
      email: 'user@eventiq.com',
      password: defaultPasswordHash,
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@eventiq.com',
      password: defaultPasswordHash,
      role: 'user',
    });

    console.log('[Seed] Created default Organizer & Users.');

    // 3. Create Sample Events
    const eventsData = [
      {
        organizerId: organizer._id,
        name: 'Tech Fest 2026',
        description: 'Annual flag-ship technology festival showcasing innovations, hackathons, guest lectures, and AI showcases.',
        category: 'Technology',
        date: '2026-10-20',
        time: '10:00 AM',
        venue: 'Main Auditorium, Tech Park',
        ticketPrice: 500,
        capacity: 1000,
        ticketsSold: 823,
        availableTickets: 177,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        organizerId: organizer._id,
        name: 'Global AI Summit 2026',
        description: 'Premier conference bringing together researchers, founders, and engineers to discuss Generative AI and Autonomous Agents.',
        category: 'Technology',
        date: '2026-11-05',
        time: '09:00 AM',
        venue: 'Convention Center, Tech Hub',
        ticketPrice: 1200,
        capacity: 500,
        ticketsSold: 490,
        availableTickets: 10,
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        organizerId: organizer._id,
        name: 'Symphony Night Live Concert',
        description: 'An unforgettable evening of orchestral music and modern instrumental symphonies.',
        category: 'Concert',
        date: '2026-09-30',
        time: '07:30 PM',
        venue: 'Grand Open Air Amphitheatre',
        ticketPrice: 750,
        capacity: 350,
        ticketsSold: 350,
        availableTickets: 0,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        organizerId: organizer._id,
        name: 'Full-Stack Web Dev Workshop',
        description: 'Hands-on 1-day immersive bootcamp building React and Node.js microservices.',
        category: 'Workshop',
        date: '2026-10-12',
        time: '11:00 AM',
        venue: 'Lab 4, Innovation Building',
        ticketPrice: 300,
        capacity: 150,
        ticketsSold: 65,
        availableTickets: 85,
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        organizerId: organizer._id,
        name: 'Cultural Extravaganza 2026',
        description: 'Celebration of music, dance, art exhibitions, and food street festivals.',
        category: 'Cultural',
        date: '2026-11-20',
        time: '04:00 PM',
        venue: 'City Festival Grounds',
        ticketPrice: 250,
        capacity: 800,
        ticketsSold: 310,
        availableTickets: 490,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`[Seed] Created ${createdEvents.length} events.`);

    // 4. Create Sample Booking for Alex Johnson
    const sampleEvent = createdEvents[0]; // Tech Fest 2026
    const qrPayload = JSON.stringify({
      bookingId: 'EVT-2026-A7F82K',
      eventId: sampleEvent._id,
      eventName: sampleEvent.name,
      userId: user1._id,
      quantity: 3,
      totalAmount: 1500,
      issuedAt: new Date().toISOString(),
    });
    const qrCode = await QRCode.toDataURL(qrPayload);

    await Booking.create({
      bookingId: 'EVT-2026-A7F82K',
      userId: user1._id,
      eventId: sampleEvent._id,
      quantity: 3,
      totalAmount: 1500,
      status: 'CONFIRMED',
      qrCode,
    });

    // 5. Create Waitlist entry for Sold Out Concert
    const soldOutEvent = createdEvents[2]; // Symphony Night Concert
    await Waitlist.create({
      userId: user2._id,
      eventId: soldOutEvent._id,
      position: 1,
      status: 'WAITING',
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('ORGANIZER: organizer@eventiq.com / password123');
    console.log('USER:      user@eventiq.com      / password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
