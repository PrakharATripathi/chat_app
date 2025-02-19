import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js";
import { port } from "./constant/constant.js";
import { app, server } from "./lib/socket.js";
// import { app, server } from "./lib/socket.js";

// const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

server.listen(port, () => {
  console.log("server is running on PORT:" + port);
  connectDB();
});

// https://github.com/burakorkmez/fullstack-chat-app/blob/master/backend/src/seeds/user.seed.js