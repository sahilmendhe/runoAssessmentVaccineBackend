const Vaccination = require("../models/Vaccination");
const Slot = require("../models/Slots");
const User = require("../models/User");
const Joi = require("joi");

const validateVaccination = (data) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required().label("Phone Number"),
    dose: Joi.number().integer().valid(1, 2).required().label("Dose"),
    slotId: Joi.string().required().label("Slot ID"),
  });
  return schema.validate(data);
};

const registerForVaccination = async (req, res) => {
  try {
    const { phoneNumber, dose, slotId } = req.body;

    // Check if the user has already registered for this dose
    const existingVaccination = await Vaccination.findOne({
      phoneNumber,
      dose,
    }).exec();
    if (existingVaccination) {
      return res
        .status(400)
        .json({ message: "User has already registered for this dose" });
    }

    if (dose === 2) {
      const firstDose = await Vaccination.findOne({
        phoneNumber,
        firstDose: [completed],
      }).exec();
      if (!firstDose || firstDose.status !== "completed") {
        return res.status(400).json({
          message:
            "User must complete the first dose before registering for the second dose",
        });
      }
    }

    const slot = await Slot.findById(slotId).exec();
    if (!slot || !slot.canRegister()) {
      return res.status(400).json({ message: "Invalid slot or slot is full" });
    }

    const vaccination = new Vaccination({
      phoneNumber,
      dose,
      slotId,
    });

    await vaccination.save();

    slot.vaccinationId = vaccination._id;
    slot.registeredUsers.push({
      user: phoneNumber,
      registrationTime: new Date(),
    });

    await slot.save();

    res
      .status(201)
      .json({ message: "Successfully registered for vaccination" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const viewRegistrations = async (req, res) => {
  try {
    const registrations = await Vaccination.find()
      .populate("phoneNumber", "name age phone")
      .populate("slotId", "startTime");
    res.status(200).json({ data: registrations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerForVaccination,
  viewRegistrations,
};
