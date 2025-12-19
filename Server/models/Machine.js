const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  toolName: {
    type: String,
    required: [true, "Tool name is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Tractor", "Tiller", "Harvester"],
    trim: true,
  },
  rentalPricePerHour: {
    type: Number,
    required: [true, "Rental price per hour is required"],
    min: [0, "Price cannot be negative"],
  },
  availableFrom: {
    type: Date,
    required: [true, "Available from date is required"],
  },
  availableTo: {
    type: Date,
    required: [true, "Available to date is required"],
    validate: {
      validator: function (value) {
        return value > this.availableFrom;
      },
      message: "Available To must be after Available From",
    },
  },
  location: {
    type: String,
  },
  pickupOption: {
    type: String,
    required: [true, "Pickup option is required"],
    enum: ["Delivery", "Self-Pickup", "Both"],
    trim: true,
  },
  rentalTerms: {
    type: String,
    required: [true, "Rental terms are required"],
    trim: true,
  },

  // --- Cloudinary integration ---
  machineImage: {
    type: String, // URL of the image
  },
  cloudinaryId: {
    type: String, // public_id for deletion
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
machineSchema.index({ toolName: 1, category: 1 });

module.exports = mongoose.model("Machine", machineSchema);
