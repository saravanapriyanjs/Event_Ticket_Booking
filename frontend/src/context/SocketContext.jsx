import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [capacityUpdates, setCapacityUpdates] = useState({});

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected:', socketInstance.id);
    });

    socketInstance.on('EVENT_CAPACITY_UPDATED', (data) => {
      console.log('[Socket.IO Frontend] Real-time Capacity Update:', data);
      setCapacityUpdates((prev) => ({
        ...prev,
        [data.eventId]: {
          availableTickets: data.availableTickets,
          ticketsSold: data.ticketsSold,
          timestamp: data.timestamp,
        },
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, capacityUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
