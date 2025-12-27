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
