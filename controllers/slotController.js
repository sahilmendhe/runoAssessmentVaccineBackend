const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Slot = require("../models/Slots");

const validateSlot = (data) => {
  const schema = Joi.object({
    phoneNumber: Joi.number()
      .integer()
      .positive()
      .required()
      .label("Phone Number"),
    password: Joi.string().required().label("Password"),
    dose: Joi.number().integer().positive().label("Dose"),
    time: Joi.string().required().label("Start Time"),
  });

  return schema.validate(data);
};

const getAvailableSlots = async (req, res) => {
  try {
    console.log("Attempting to get available slots");
    const allSlots = await Slot.find().exec();
    console.log("Slots:", allSlots);
    res.status(200).json({ success: true, slots: allSlots });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const bookSlot = async (req, res) => {
  const { time, dose, date } = req.body;

  const allowedTimeSlots = [
    "10:00AM",
    "10:30AM",
    "11:00AM",
    "11:30AM",
    "12:00PM",
    "12:30PM",
    "1:00PM",
    "1:30PM",
    "2:00PM",
    "2:30PM",
    "3:00PM",
    "3:30PM",
    "4:00PM",
    "4:30PM",
    "5:00PM",
  ];

  // Check if the provided time is in the allowed slots
  if (!allowedTimeSlots.includes(time)) {
    return res.status(400).json({ success: false, error: "Invalid time slot" });
  }

  try {
    const { phoneNumber, password } = req.body;

    // Parse the date in the format "YYYY-MM-DD"
    const parsedDate = new Date(date);

    // Authenticate user
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    // Check if the user already has a booked slot
    const existingSlot = await Slot.findOne({
      "bookedUsers.user": user._id,
    }).exec();

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        error: "User has already booked a slot",
      });
    }

    // Check if the user has completed the first dose
    if (dose === 2 && !user.firstDose.completed) {
      return res.status(400).json({
        success: false,
        error: "Cannot book 2nd dose without completing 1st dose",
      });
    }

    // Check if both doses are completed
    if (user.firstDose.completed && user.secondDose.completed) {
      return res.status(400).json({
        success: false,
        error: "User has completed both doses, cannot book a new slot",
      });
    }

    // Find the slot in the database by date and time using slotSchema
    const slot = await Slot.findOne({
      // date: date,
      startTime: time,
    }).exec();
    console.log(slot, date);

    if (!slot) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }

    // Check if the slot can be registered
    if (!slot.canRegister()) {
      return res.status(400).json({ success: false, error: "Slot is full" });
    }

    // Register the user for the slot
    const bookingTime = new Date();
    const bookingExpirationTime = new Date(bookingTime);
    bookingExpirationTime.setHours(bookingExpirationTime.getHours() + 24);

    // Save booked slot to the database
    slot.bookedUsers.push({
      user: user._id,
      bookingTime,
      dose,
    });

    // Mark the dose as completed if the booking slot has passed the time
    if (isLapsed(bookingTime, slot.startTime)) {
      if (dose === 1) {
        user.firstDose.completed = true;
      } else if (dose === 2) {
        user.secondDose.completed = true;
      }
    }

    await user.save();
    await slot.save();

    console.log("Slot booked successfully at time:", time);
    res
      .status(200)
      .json({ success: true, message: "Slot booked successfully" });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const isLapsed = (registrationTime, slottime) =>
  new Date(registrationTime).getTime() > new Date(slottime).getTime();

const canUpdateSlot = (slottime) => {
  const timeDifferenceInMilliseconds =
    new Date(slottime).getTime() - new Date().getTime();
  const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
  return timeDifferenceInHours < 24; // User can update slot only before 24 hours
};

const updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { newtime } = req.body;

    const { error: validationError } = Joi.object({
      newtime: Joi.string().required().label("New Start Time"),
    }).validate({ newtime });

    if (validationError) {
      return res
        .status(400)
        .json({ success: false, error: validationError.details[0].message });
    }

    const slot = await Slot.findById(slotId).exec();

    if (!slot) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }

    if (canUpdateSlot(slot.startTime)) {
      return res.status(403).json({
        success: false,
        error: "User can update slot only before 24 hours",
      });
    }

    slot.startTime = newtime;
    slot.endTime = new Date(slot.startTime);
    slot.endTime.setMinutes(slot.endTime.getMinutes() + 30);

    await slot.save();

    res
      .status(200)
      .json({ success: true, message: "Slot updated successfully" });
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getAvailableSlots,
  bookSlot,
  updateSlot,
};
