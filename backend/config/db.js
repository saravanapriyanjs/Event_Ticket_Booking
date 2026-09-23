const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoMemoryServer = null;

const autoSeedIfEmpty = async () => {
  const User = require('../models/User');
  const Organizer = require('../models/Organizer');
  const Event = require('../models/Event');
  const Booking = require('../models/Booking');
  const Waitlist = require('../models/Waitlist');
  const QRCode = require('qrcode');

  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  console.log('[AutoSeed] Empty database detected. Seeding demo accounts and events...');

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  const organizer = await Organizer.create({
    name: 'Sarah Connor',
    email: 'organizer@eventiq.com',
    password: defaultPasswordHash,
    organizationName: 'TechEvents Global Inc.',
    role: 'organizer',
  });

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
  
  const sampleEvent = createdEvents[0];
  const qrPayload = JSON.stringify({
    bookingId: 'EVT-2026-A7F82K',
    eventId: sampleEvent._id,
    eventName: sampleEvent.name,
    userId: user1._id,
    quantity: 3,
    totalAmount: 1500,
    issuedAt: new Date().toISOString(),
  });
  const qrCode = await QRCode.toDataURL(qrPayload).catch(() => '');

  await Booking.create({
    bookingId: 'EVT-2026-A7F82K',
    userId: user1._id,
    eventId: sampleEvent._id,
    quantity: 3,
    totalAmount: 1500,
    status: 'CONFIRMED',
    qrCode,
  });

  const soldOutEvent = createdEvents[2];
  await Waitlist.create({
    userId: user2._id,
    eventId: soldOutEvent._id,
    position: 1,
    status: 'WAITING',
  });

  console.log('[AutoSeed] Successfully seeded demo data!');
  console.log('--------------------------------------------------');
  console.log('ORGANIZER: organizer@eventiq.com / password123');
  console.log('USER:      user@eventiq.com      / password123');
  console.log('--------------------------------------------------');
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventiq';
  
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB] Connected to local MongoDB daemon: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Local MongoDB daemon not detected at 127.0.0.1:27017 (${error.message}).`);
    console.log('[MongoDB Engine]: Initializing embedded MongoMemoryServer for standalone execution...');
    
    try {
      await mongoose.disconnect();
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Engine] Embedded MongoMemoryServer active at: ${conn.connection.host}`);
    } catch (memError) {
      console.error('[MongoDB Critical Error]: Failed starting embedded MongoMemoryServer:', memError.message);
      return;
    }
  }

  try {
    await autoSeedIfEmpty();
  } catch (seedErr) {
    console.error('[AutoSeed Error]:', seedErr.message);
  }
};

module.exports = connectDB;
