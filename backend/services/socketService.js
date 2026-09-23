let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_event_room', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room event_${eventId}`);
    });

    socket.on('leave_event_room', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const broadcastCapacityUpdate = (eventId, availableTickets, ticketsSold) => {
  if (io) {
    const payload = { eventId, availableTickets, ticketsSold, timestamp: new Date() };
    // Broadcast to specific event room and to global listeners
    io.to(`event_${eventId}`).emit('EVENT_CAPACITY_UPDATED', payload);
    io.emit('EVENT_CAPACITY_UPDATED', payload);
    console.log(`[Socket.IO] Broadcast EVENT_CAPACITY_UPDATED for event ${eventId}: ${availableTickets} available`);
  }
};

module.exports = {
  initSocket,
  broadcastCapacityUpdate,
};
