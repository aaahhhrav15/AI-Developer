import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Project from './models/projectModel.js';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import { send } from 'process';
import { generateResult } from './services/aiService.js';

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
      await connectDB();
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
      const projectId = socket.handshake.query.projectId;
      console.log("Project ",projectId);

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
          return next(new Error('Invalid projectId'));
      }

      socket.project = await Project.findById(projectId);


      if (!token) {
          return next(new Error('Authentication error'))
      }
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
  
  console.log("A user connected!");

  socket.join(socket.project._id.toString());

  socket.on('project-message', async data => {
    const message = data.message;
    console.log("📩 Received message:", message);
  
    io.to(socket.project._id.toString()).emit('project-message', data);
  
    const aiIsPresent = message.includes("@ai");
    if (aiIsPresent) 
    {
      const prompt = message.replace("@ai", "").trim();
      const result = await generateResult(prompt);
  
      io.to(socket.project._id.toString()).emit('project-message', {
        message: result,
        sender: {
          _id: "ai",
          email:"AI",
        }
      });
    }
  });

  socket.on("event", (data) => {
    console.log("📩 Received event:", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected!");
    socket.leave(socket.project._id.toString());
  });
});

httpServer.listen(3001, () => {
  console.log("🚀 Socket.IO server running on 3001");
});
