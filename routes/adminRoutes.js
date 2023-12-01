const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Admin login
router.post("/login", adminController.adminLogin);

// Get total users registered and filter by Age/Pincode/Vaccination status
router.get("/users", adminController.getUsers);

// Get registered slots for the vaccine
router.get("/registered-slots", adminController.getRegisteredSlots);

// Get vaccination status details for a specific user
router.get("/vaccination-status/:userId", adminController.getVaccinationStatus);

// Create admin user (for initialization)
router.post("/create-admin-user", adminController.createAdminUser);

module.exports = router;
