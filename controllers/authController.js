const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const validationSchema = Joi.object({
  phoneNumber: Joi.string().required().label("Phone Number"),
  password: Joi.string().required().label("Password"),
});

const loginUser = async (req, res) => {
  try {
    const { error } = validationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Phone Number or Password" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Invalid Phone Number or Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ data: token, message: "Logged in successfully" });
    console.log("User logged in successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { loginUser };
