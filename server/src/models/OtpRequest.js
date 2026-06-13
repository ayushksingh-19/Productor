const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema(
  {
    code: {
      required: true,
      type: String,
    },
    expiresAt: {
      required: true,
      type: Date,
    },
    identifier: {
      required: true,
      trim: true,
      type: String,
    },
    usedAt: {
      default: null,
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OtpRequest", otpRequestSchema);
