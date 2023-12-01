const User = require("../models/User");
const Slot = require("../models/Slots"); // Update model name from Slots to Slot
const Vaccination = require("../models/Vaccination");
const Admin = require("../models/Admin"); // Add Admin model

// Admin login
const adminLogin = async (req, res) => {
  try {
    // Assuming admin credentials are hard-coded for simplicity
    const { username, password } = req.body;

    if (username === "admin" && password === "adminpassword") {
      // For demonstration purposes, you may want to generate a token and send it back
      res.status(200).json({ message: "Admin login successful" });
    } else {
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get total users registered and filter by Age/Pincode/Vaccination status
const getUsers = async (req, res) => {
  try {
    const { age, pincode, vaccinationStatus } = req.query;

    let filter = {};
    if (age) {
      filter.age = age;
    }
    if (pincode) {
      filter.pincode = pincode;
    }
    if (vaccinationStatus) {
      filter.vaccinationStatus = vaccinationStatus;
    }

    const users = await User.find(filter).exec();
    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get registered slots for the vaccine
const getRegisteredSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate(
      "bookedUsers.user",
      "fullName age phoneNumber"
    );
    res.status(200).json({ data: slots });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get vaccination status details
const getVaccinationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Assuming the userId is provided in the request parameters
    const userVaccinationStatus = await Vaccination.findOne({ user: userId });

    if (!userVaccinationStatus) {
      return res.status(404).json({ message: "Vaccination status not found" });
    }

    res.status(200).json({ data: userVaccinationStatus });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create admin user (for initialization)
const createAdminUser = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "admin" });

    if (!existingAdmin) {
      const newAdmin = new Admin({
        username: "admin",
        password: "adminpassword", // Ensure to hash the password before saving it in a real-world scenario
      });

      await newAdmin.save();
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = {
  adminLogin,
  getUsers,
  getRegisteredSlots,
  getVaccinationStatus,
  createAdminUser,
};
