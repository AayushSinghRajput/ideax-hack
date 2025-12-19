const mongoose = require("mongoose");

const PrebookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    item_type: {
      type: String,
      enum: ["crop", "tool"],
      required: true,
    },
    quantity: { type: Number, default: 0 },
    rentalHours: { type: Number, default: 0 },
    preferred_date: Date,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prebooking", PrebookingSchema);
