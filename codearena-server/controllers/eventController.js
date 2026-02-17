const Event = require("../models/Event");
const asyncHandler = require("express-async-handler");

// @desc    Verify event access code
// @route   POST /api/events/verify
// @access  Public
const verifyEventCode = asyncHandler(async (req, res) => {
  const { eventId, code } = req.body;

  if (!eventId || !code) {
    res.status(400);
    throw new Error("Please include eventId and code");
  }

  // Find the event
  let event = await Event.findOne({ eventId });

  // If event doesn't exist, check if it's the "blind-coding" event and initialize it with default code
  if (!event && eventId === "blind-coding") {
    event = await Event.create({
      eventId: "blind-coding",
      title: "Blind Coding",
      accessCode: "123456", // Default code requested by user
    });
  }

  if (event && event.accessCode === code) {
    res.status(200).json({
      success: true,
      message: "Access granted",
      eventId: event.eventId,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Access Code");
  }
});

// @desc    Update event access code
// @route   PUT /api/events/:eventId
// @access  Private (should be admin protected, but for now open)
const updateEventCode = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { accessCode } = req.body;

  if (!accessCode) {
    res.status(400);
    throw new Error("Please include accessCode");
  }

  let event = await Event.findOne({ eventId });

  if (event) {
    event.accessCode = accessCode;
    await event.save();
    res.status(200).json({
      success: true,
      event,
    });
  } else {
    // Create if not exists
    event = await Event.create({
      eventId,
      title: "Event",
      accessCode,
    });
    res.status(201).json({
      success: true,
      event,
    });
  }
});

module.exports = {
  verifyEventCode,
  updateEventCode,
};
