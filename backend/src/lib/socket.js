import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Frontend_URI } from "../constant/constant.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:Frontend_URI,
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
  if (userId) {
    userSocketMap[userId] = socket.id;
    // Make this user join their own room for direct messages
    socket.join(userId);
  }

   // Join all group rooms the user is part of
   if (socket.handshake.query.groups) {
    try {
      const groups = JSON.parse(socket.handshake.query.groups);
      if (Array.isArray(groups)) {
        groups.forEach(groupId => {
          socket.join(`group:${groupId}`);
          console.log(`User ${userId} joined group:${groupId} on connect`);
        });
      }
    } catch (error) {
      console.error("Error parsing groups:", err);
    }
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle joining a new group
  socket.on("joinGroup", (groupId) => {
    socket.join(`group:${groupId}`);
    console.log(`User ${userId} joined group:${groupId}`);
  });

   // Handle leaving a group
   socket.on("leaveGroup", (groupId) => {
    socket.leave(`group:${groupId}`);
    console.log(`User ${userId} left group:${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Expose a function to emit group messages to all members
export function emitGroupMessage(groupId, message) {
  io.to(`group:${groupId}`).emit("newGroupMessage", message);
}

export { io, app, server };