import express from "express";
const router = express.Router();

/* -------- USERS (DEMO LOGIN) -------- */
const users = [
  { email: "admin@mail.com", password: "admin", role: "admin" },
  { email: "user@mail.com", password: "user", role: "user" }
];

/* -------- DATA -------- */
let slots = [];
let bookings = [];
let slotId = 1;
let bookingId = 1;

/* -------- LOGIN -------- */
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ role: user.role });
});

/* -------- USER -------- */
router.get("/slots", (req, res) => {
  res.json(slots.filter(s => !s.booked));
});

router.post("/book/:id", (req, res) => {
  const slot = slots.find(s => s.id == req.params.id);
  if (!slot || slot.booked) {
    return res.status(400).json({ message: "Slot not available" });
  }

  slot.booked = true;
  bookings.push({
    id: bookingId++,
    slotId: slot.id,
    time: slot.time
  });

  res.json({ message: "Appointment booked" });
});

/* -------- ADMIN -------- */
router.post("/admin/slot", (req, res) => {
  slots.push({
    id: slotId++,
    time: req.body.time,
    booked: false
  });
  res.json({ message: "Slot added" });
});

router.get("/admin/bookings", (req, res) => {
  res.json(bookings);
});

router.delete("/admin/cancel/:id", (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const booking = bookings[index];
  const slot = slots.find(s => s.id == booking.slotId);
  if (slot) slot.booked = false;

  bookings.splice(index, 1);
  res.json({ message: "Booking cancelled" });
});

export default router;
