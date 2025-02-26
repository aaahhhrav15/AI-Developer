import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Project from './models/projectModel.js';
import dotenv from 'dotenv';

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {

  try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
      // const projectId = socket.handshake.query.projectId;
      // console.log(projectId);

      // if (!mongoose.Types.ObjectId.isValid(projectId)) {
      //     return next(new Error('Invalid projectId'));
      // }


      // socket.project = await Project.findById(projectId);


      if (!token) {
          return next(new Error('Authentication error'))
      }
      console.log("Hello "+process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
          return next(new Error('Authentication error'))
      }


      socket.user = decoded;

      next();

  } catch (error) {
      next(error)
  }

})

io.on("connection", (socket) => {
  console.log("🔥 A user connected!");

  socket.on("event", (data) => {
    console.log("📩 Received event:", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected!");
  });
});

httpServer.listen(3001, () => {
  console.log("🚀 Socket.IO server running on 3001");
});
