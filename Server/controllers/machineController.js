const Machine = require("../models/Machine");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get all machines with filtering, sorting, pagination
// @route   GET /api/machines
// @access  Public
const getMachines = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Machine.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(",").join(" "));
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      query = query.select(req.query.fields.split(",").join(" "));
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const machines = await query;
    const total = await Machine.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      success: true,
      count: machines.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: machines,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllMachinesName = async (req, res) => {
  try {
    const machines = await Machine.find(
      {},
      { toolName: 1, availableFrom: 1, availableTo: 1 }
    );
    res.json(machines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch machines" });
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Public
const getMachine = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid machine ID" });
    }

    const machine = await Machine.findById(req.params.id).lean();
    if (!machine)
      return res
        .status(404)
        .json({ success: false, error: "Machine not found" });

    const now = new Date();
    machine.isAvailable =
      now >= new Date(machine.availableFrom) &&
      now <= new Date(machine.availableTo);

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new machine with image upload
// @route   POST /api/machines
// @access  Private/Admin
const createMachine = async (req, res) => {
  try {
    const requiredFields = [
      "toolName",
      "category",
      "rentalPricePerHour",
      "availableFrom",
      "availableTo",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Missing fields: ${missingFields.join(", ")}`,
        });
    }

    const validCategories = ["Tractor", "Tiller", "Harvester"];
    if (!validCategories.includes(req.body.category)) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(
            ", "
          )}`,
        });
    }

    if (new Date(req.body.availableFrom) >= new Date(req.body.availableTo)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Available To date must be after Available From date",
        });
    }

    const machineData = { ...req.body };

    if (req.file) {
      machineData.machineImage = req.file.path; // Cloudinary URL
      machineData.cloudinaryId = req.file.filename; // Public ID for deletion
    }

    const machine = await Machine.create(machineData);

    res.status(201).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update machine with optional image replacement
// @route   PUT /api/machines/:id
// @access  Private/Admin
const updateMachine = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid machine ID" });
    }

    const machine = await Machine.findById(req.params.id);
    if (!machine)
      return res
        .status(404)
        .json({ success: false, error: "Machine not found" });

    if (
      req.body.availableFrom &&
      req.body.availableTo &&
      new Date(req.body.availableFrom) >= new Date(req.body.availableTo)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Available To date must be after Available From date",
        });
    }

    // Allowed updates
    const allowedUpdates = [
      "toolName",
      "category",
      "rentalPricePerHour",
      "availableFrom",
      "availableTo",
      "pickupOption",
      "rentalTerms",
    ];
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) machine[key] = req.body[key];
    });

    // Handle image replacement
    if (req.file) {
      if (machine.cloudinaryId) {
        await cloudinary.uploader.destroy(machine.cloudinaryId); // Delete old image
      }
      machine.machineImage = req.file.path;
      machine.cloudinaryId = req.file.filename;
    }

    await machine.save();
    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete machine and associated image
// @route   DELETE /api/machines/:id
// @access  Private/Admin
const deleteMachine = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid machine ID" });
    }

    const machine = await Machine.findById(req.params.id);
    if (!machine)
      return res
        .status(404)
        .json({ success: false, error: "Machine not found" });

    // Delete image from Cloudinary
    if (machine.cloudinaryId) {
      await cloudinary.uploader.destroy(machine.cloudinaryId);
    }

    await Machine.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getMachines,
  getAllMachinesName,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
};
