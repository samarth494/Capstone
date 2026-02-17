const express = require("express");
const router = express.Router();
const {
  verifyEventCode,
  updateEventCode,
} = require("../controllers/eventController");

router.post("/verify", verifyEventCode);
router.put("/:eventId", updateEventCode);

module.exports = router;
