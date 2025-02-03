// src/services/socket.js
import { io } from 'socket.io-client';

// Giả sử bạn có một server socket.io chạy tại 'http://localhost:8000'
const URL = 'http://localhost:1337';

// Khởi tạo kết nối socket
export const socket = io(URL, {
  autoConnect: false, // Tự động kết nối khi bạn gọi socket.connect()
});

// Hàm để kết nối
export const connectSocket = () => {
  socket.connect();
};

// Hàm để ngắt kết nối
export const disconnectSocket = () => {
  socket.disconnect();
};