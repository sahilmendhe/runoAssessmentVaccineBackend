const mongoose = require("mongoose");
const Joi = require("joi");

const vaccinationSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  dose: {
    type: Number, // 1 or 2
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true,
  },
  status: {
    type: String, // 'pending', 'completed'
    default: "pending",
  },
});

const Vaccination = mongoose.model("Vaccination", vaccinationSchema);

const validateVaccination = (data) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required().label("Phone Number"),
    dose: Joi.number().integer().valid(1, 2).required().label("Dose"),
    slotId: Joi.string().required().label("Slot ID"),
  });
  return schema.validate(data);
};

module.exports = Vaccination;
