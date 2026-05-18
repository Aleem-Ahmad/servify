import { io } from "socket.io-client";

let socket;

export const initiateSocket = (room) => {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");
  if (socket && room) socket.emit("join", room);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const subscribeToTracking = (cb) => {
  if (!socket) return;
  socket.on("locationUpdate", (data) => {
    return cb(data);
  });
};

export const emitLocation = (room, location) => {
  if (socket) socket.emit("updateLocation", { room, location });
};
