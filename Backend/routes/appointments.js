import express from "express";
import db from "../db.js";

const router = express.Router();

/* ======================
   LOGIN (DB BASED)
====================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ role: result[0].role });
  });
});

/* ======================
   USER: GET AVAILABLE SLOTS
====================== */
router.get("/slots", (req, res) => {
  db.query(
    "SELECT * FROM slots WHERE booked=false",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/* ======================
   USER: BOOK SLOT
====================== */
router.post("/book/:id", (req, res) => {
  const slotId = req.params.id;

  db.query(
    "SELECT * FROM slots WHERE id=? AND booked=false",
    [slotId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) {
        return res.status(400).json({ message: "Slot not available" });
      }

      const time = results[0].time;

      db.query(
        "UPDATE slots SET booked=true WHERE id=?",
        [slotId]
      );

      db.query(
        "INSERT INTO bookings (slot_id, time) VALUES (?,?)",
        [slotId, time]
      );

      res.json({ message: "Appointment booked" });
    }
  );
});

/* ======================
   ADMIN: ADD SLOT
====================== */
router.post("/admin/slot", (req, res) => {
  db.query(
    "INSERT INTO slots (time, booked) VALUES (?,false)",
    [req.body.time],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Slot added" });
    }
  );
});

/* ======================
   ADMIN: VIEW BOOKINGS
====================== */
router.get("/admin/bookings", (req, res) => {
  db.query(
    `SELECT bookings.id, slots.time 
     FROM bookings 
     JOIN slots ON bookings.slot_id = slots.id`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/* ======================
   ADMIN: CANCEL BOOKING
====================== */
router.delete("/admin/cancel/:id", (req, res) => {
  const bookingId = req.params.id;

  db.query(
    "SELECT * FROM bookings WHERE id=?",
    [bookingId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const slotId = results[0].slot_id;

      db.query("DELETE FROM bookings WHERE id=?", [bookingId]);
      db.query("UPDATE slots SET booked=false WHERE id=?", [slotId]);

      res.json({ message: "Booking cancelled" });
    }
  );
});

export default router;
