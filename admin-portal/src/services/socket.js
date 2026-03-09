import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin, {
  transports: ['websocket']
});

export default socket;
