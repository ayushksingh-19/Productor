const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    displayName: {
      required: true,
      trim: true,
      type: String,
    },
    identifier: {
      required: true,
      trim: true,
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
