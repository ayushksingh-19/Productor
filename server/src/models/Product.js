const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    brandName: {
      required: true,
      trim: true,
      type: String,
    },
    images: {
      default: [],
      type: [String],
    },
    isExchangeable: {
      default: true,
      type: Boolean,
    },
    mrp: {
      min: 0,
      required: true,
      type: Number,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
    quantity: {
      min: 0,
      required: true,
      type: Number,
    },
    sellingPrice: {
      min: 0,
      required: true,
      type: Number,
    },
    status: {
      default: "unpublished",
      enum: ["published", "unpublished"],
      type: String,
    },
    type: {
      required: true,
      trim: true,
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
