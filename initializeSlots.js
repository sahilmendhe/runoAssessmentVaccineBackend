const mongoose = require("mongoose");
const Slot = require("./models/Slots");

// Function to initialize slots
const initializeSlots = async () => {
  try {
    const existingSlots = await Slot.find().limit(1);

    if (existingSlots.length === 0) {
      const startDate = new Date("2021-06-01");
      const endDate = new Date("2021-06-30");
      const timeSlots = [
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
      ];

      const slots = [];
      let slotIdCounter = 1; // Initialize slot id counter

      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        timeSlots.forEach((time) => {
          const startTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            parseInt(time.split(":")[0]),
            parseInt(time.split(":")[1]),
            0,
            0
          );

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 30);

          slots.push({
            slotId: slotIdCounter++, // Increment the slot id
            date: currentDate,
            startTime: time,
            endTime: endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            maxCapacity: 10,
            bookedUsers: [],
          });
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      await Slot.insertMany(slots);
      console.log("Slots initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing slots:", error);
  } finally {
    mongoose.connection;
  }
};

// Export the function
module.exports = initializeSlots;
