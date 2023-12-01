const express = require("express");
const vaccinationController = require("../controllers/vaccinationController");

const router = express.Router();

router.post("/register", vaccinationController.registerForVaccination);

router.get(
  "/admin/view-registrations",
  vaccinationController.viewRegistrations
);

module.exports = router;
