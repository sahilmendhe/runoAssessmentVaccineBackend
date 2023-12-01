const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const initializeSlots = require("./initializeSlots");
const slotController = require("./controllers/slotController");

require("dotenv").config();

const adminController = require("./controllers/adminController");

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Database connection
const password = encodeURIComponent("Pass@123");

mongoose.connect(
  `mongodb+srv://SynthCyber:${password}@articles.zd85s5p.mongodb.net/vaccination?retryWrites=true&w=majority`
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const slotRoutes = require("./routes/slotRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/slot", slotRoutes);
app.use("/vaccination", vaccinationRoutes);
app.use("/admin", adminRoutes);

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT || 8000;
adminController.createAdminUser();
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
