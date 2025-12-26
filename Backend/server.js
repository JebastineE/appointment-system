import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Required for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Root route -> frontend index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// API routes
app.use("/api", appointmentRoutes);

import testRoute from "./routes/test.js";
app.use("/api", testRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
