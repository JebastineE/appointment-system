import db from "./db.js";

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Database working ✅" });
  });
});

app.use(express.static(path.join(__dirname, "../Frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.use("/api", appointmentRoutes);

import testRoute from "./routes/test.js";
app.use("/api", testRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
