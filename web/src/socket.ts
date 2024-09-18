// import io from 'socket.io-client';
import { io } from 'socket.io-client';

const api_url = import.meta.env.VITE_SERVER_URL;

const socket = io(api_url, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
