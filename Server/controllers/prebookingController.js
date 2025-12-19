const Prebooking = require("../models/Prebooking");
const Product = require("../models/Product");
const Machine = require("../models/Machine");

// -----------------------------
// Utility: Check crop availability
// -----------------------------
const checkCropAvailability = async (item_id, quantity) => {
  const product = await Product.findById(item_id);
  if (!product) return { ok: false, message: "Product not found" };
  if (product.quantity < quantity) return { ok: false, message: "Not enough stock" };
  if (!["Vegetables", "Fruits", "Grains"].includes(product.category)) {
    return { ok: false, message: "Prebooking allowed only for crops" };
  }
  return { ok: true, product };
};

// -----------------------------
// Utility: Check machine availability
// -----------------------------
const checkMachineAvailability = async (machine_id, startDate, endDate) => {
  const machine = await Machine.findById(machine_id);
  if (!machine) return { ok: false, message: "Machine not found" };

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  // Check machine available date range
  if (sDate < machine.availableFrom || eDate > machine.availableTo) {
    return { ok: false, message: "Machine not available for selected dates" };
  }

  // Check overlapping bookings
  const overlapping = await Prebooking.findOne({
    item_id: machine_id,
    item_type: "tool",
    status: { $in: ["pending", "confirmed"] },
    $or: [
      { startDate: { $lte: eDate }, endDate: { $gte: sDate } },
    ],
  });

  if (overlapping) {
    return { ok: false, message: "Machine already booked for these dates" };
  }

  return { ok: true, machine };
};

// -----------------------------
// Create Prebooking
// -----------------------------
// exports.createPrebooking = async (req, res) => {
//   try {
//     const { user_id, item_id, item_type, quantity, rentalHours, preferred_date, startDate, endDate, notes } = req.body;

//     if (!user_id || !item_id || !item_type) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Crop prebooking
//     if (item_type === "crop") {
//       const availability = await checkCropAvailability(item_id, quantity);
//       if (!availability.ok) return res.status(400).json({ message: availability.message });

//       availability.product.quantity -= quantity;
//       await availability.product.save();
//     } 
//     // Tool prebooking
//     else if (item_type === "tool") {
//       if (!startDate || !endDate) {
//         return res.status(400).json({ message: "Start and end dates are required for tool prebooking" });
//       }

//       const availability = await checkMachineAvailability(item_id, startDate, endDate);
//       if (!availability.ok) return res.status(400).json({ message: availability.message });
//     } 
//     else {
//       return res.status(400).json({ message: "Invalid item type" });
//     }

//     const prebooking = await Prebooking.create({
//       user_id,
//       item_id,
//       item_type,
//       quantity: item_type === "crop" ? quantity : 0,
//       rentalHours: item_type === "tool" ? rentalHours || 0 : 0,
//       preferred_date: item_type === "crop" ? preferred_date : null,
//       startDate: item_type === "tool" ? startDate : null,
//       endDate: item_type === "tool" ? endDate : null,
//       notes,
//       status: "pending",
//     });

//     res.status(201).json({ message: "Prebooking created successfully", prebooking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to create prebooking" });
//   }
// };


exports.createPrebooking = async (req, res) => {
  try {
    const {
      user_id,
      farmer_id,
      item_id,
      item_type,
      quantity,
      rentalHours,
      preferred_date,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!user_id || !farmer_id || !item_id || !item_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prebooking = await Prebooking.create({
      user_id,
      farmer_id,
      item_id,
      item_type,
      quantity: item_type === "crop" ? quantity : 0,
      rentalHours: item_type === "tool" ? rentalHours : 0,
      preferred_date,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({
      message: "Prebooking created successfully",
      prebooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create prebooking" });
  }
};



// -----------------------------
// Get all prebookings for a user
// -----------------------------
exports.getUserPrebookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const bookings = await Prebooking.find({ user_id })
      .populate("item_id")
      .sort({ preferred_date: 1, startDate: 1 }); // sort by both crop date and tool startDate
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch prebookings" });
  }
};

// -----------------------------
// Update prebooking status
// -----------------------------
exports.updatePrebookingStatus = async (req, res) => {
  try {
    const { prebooking_id, status } = req.body;

    const booking = await Prebooking.findById(prebooking_id);
    if (!booking) return res.status(404).json({ message: "Prebooking not found" });

    // Revert crop stock if cancelled
    if (status === "cancelled" && booking.item_type === "crop") {
      const product = await Product.findById(booking.item_id);
      if (product) {
        product.quantity += booking.quantity;
        await product.save();
      }
    }

    booking.status = status;
    booking.updated_at = Date.now();
    await booking.save();

    res.json({ message: `Prebooking ${status} successfully`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update prebooking status" });
  }
};

// -----------------------------
// Cancel expired prebookings automatically
// -----------------------------
exports.cancelExpiredPrebookings = async () => {
  try {
    const today = new Date();
    const expired = await Prebooking.updateMany(
      { status: "pending", $or: [
          { preferred_date: { $lt: today } },
          { endDate: { $lt: today } }
        ]
      },
      { status: "cancelled", updated_at: today }
    );
    console.log(`Expired prebookings cancelled: ${expired.modifiedCount}`);
  } catch (err) {
    console.error("Error cancelling expired prebookings:", err);
  }
};
