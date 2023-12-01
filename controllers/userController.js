const { User, validateUser } = require("../models/User");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const { error } = validateUser(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userByAadhar = await User.findOne({
      aadharNumber: req.body.aadharNumber,
    });

    const userByPhoneNumber = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (userByAadhar) {
      return res.status(409).json({ message: "Aadhar number already exists" });
    } else if (userByPhoneNumber) {
      return res.status(409).json({ message: "Phone number already exists" });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      fullName: req.body.fullName,
      aadharNumber: req.body.aadharNumber,
      age: req.body.age,
      phoneNumber: req.body.phoneNumber,
      pinCode: req.body.pinCode,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createUser };
