import "./src/config/env.js";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import cashFlowRoutes from "./src/routes/cashFlowRoutes.js";
import caseRoutes from "./src/routes/caseRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import connectDB from "./src/config/db.js";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import chatHandlers from "./src/socket/chatHandlers.js";
import cors from "cors";

connectDB();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cashFlow", cashFlowRoutes);

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
  chatHandlers(io, socket);
});

server.listen(process.env.PORT, () => {
  console.log("HTTP + Socket.IO running on port 5000");
});
