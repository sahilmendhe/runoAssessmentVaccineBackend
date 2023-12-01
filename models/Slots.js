const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotId: { type: Number, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxCapacity: { type: Number, default: 10 },
  bookedUsers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      dose: { type: Number, enum: [1, 2], required: true },
      bookingTime: { type: Date, required: true },
    },
  ],
});

slotSchema.methods.canRegister = function () {
  return this.bookedUsers.length < this.maxCapacity;
};

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;
