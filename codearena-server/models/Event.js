const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    accessCode: {
      type: String,
      default: "123456", // Default access code as requested, changeable later
    },
    startTime: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
