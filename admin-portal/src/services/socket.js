import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: false,
});

export default socket;
