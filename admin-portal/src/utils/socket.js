import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const token = import.meta.env.VITE_ADMIN_TOKEN;

export const socket = io(URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: false,
});
