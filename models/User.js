const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  pinCode: { type: Number, required: true },
  age: { type: Number, required: true },
  aadharNumber: { type: Number, required: true },
  password: { type: String, required: true },
  firstDose: {
    date: { type: Date },
    completed: { type: Boolean, default: false },
  },
  secondDose: {
    date: { type: Date },
    completed: { type: Boolean, default: false },
  },
  vaccinationCompleted: { type: Boolean, default: false },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

// Validation schema for user data
const validateUser = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(30).required().label("Full Name"),
    password: Joi.string().min(8).required().label("Password"),
    phoneNumber: Joi.number()
      .integer()
      .positive()
      .required()
      .label("Phone Number"),
    pinCode: Joi.number().integer().positive().required().label("Pin Code"),
    age: Joi.number().integer().min(18).required().label("Age"),
    aadharNumber: Joi.number()
      .integer()
      .positive()
      .required()
      .label("Aadhar Number"),
  });

  return schema.validate(data);
};

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(30).label("Full Name"),
    password: Joi.string().min(8).label("Password"),
    phoneNumber: Joi.number().integer().positive().label("Phone Number"),
    pinCode: Joi.number().integer().positive().label("Pin Code"),
    age: Joi.number().integer().min(18).label("Age"),
    aadharNumber: Joi.number().integer().positive().label("Aadhar Number"),
    firstDose: {
      date: Joi.date(),
      completed: Joi.boolean(),
    },
    secondDose: {
      date: Joi.date(),
      completed: Joi.boolean(),
    },
    vaccinationCompleted: Joi.boolean(),
  });

  return schema.validate(data);
};

module.exports = User;
