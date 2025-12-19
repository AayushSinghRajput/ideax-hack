const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: ["Vegetables", "Fruits", "Grains", "Other"],
        message: "Please select a valid category",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxLength: [200, "Location cannot exceed 200 characters"],
    },

    // Farmer reference
    farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // --- Cloudinary integration ---
    productImage: {
      type: String, // Stores Cloudinary URL
      default: null,
    },
    cloudinaryId: {
      type: String, // Stores public_id for deletion/update
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    deliveryOption: {
      type: String,
      required: [true, "Delivery option is required"],
      enum: {
        values: ["home_delivery", "self_pickup", "both"],
        message: "Please select a valid delivery option",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for better search performance
productSchema.index({ productName: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
