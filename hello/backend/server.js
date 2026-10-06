import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI is loaded
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

// MongoDB connection
let isMongoConnected = false;

mongoose.connect(MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  isMongoConnected = true;
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('⚠️  Server will run but database operations will fail');
  console.error('💡 To fix: Check your MongoDB Atlas IP whitelist or use local MongoDB');
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: 'running',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get("/", (req, res) => {
  res.send("FlowTask API is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
