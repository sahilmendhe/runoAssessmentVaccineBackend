const express = require("express");
const slotController = require("../controllers/slotController");

const router = express.Router();

router.get("/available-slots", slotController.getAvailableSlots);
router.post("/book-slot", slotController.bookSlot);
router.put("/update-slot/:slotId", slotController.updateSlot);

module.exports = router;
