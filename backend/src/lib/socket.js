import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

   // Join all group rooms the user is part of
   if (socket.handshake.query.groups) {
    const groups = JSON.parse(socket.handshake.query.groups);
    groups.forEach(groupId => {
      socket.join(`group:${groupId}`);
    });
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle joining a new group
  socket.on("joinGroup", (groupId) => {
    socket.join(`group:${groupId}`);
  });

   // Handle leaving a group
   socket.on("leaveGroup", (groupId) => {
    socket.leave(`group:${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };