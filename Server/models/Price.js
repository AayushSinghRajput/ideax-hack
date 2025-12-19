const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  commodity_np: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  avg: { type: Number, required: true },
  date: { type: Date, required: true, index: true },
});

module.exports = mongoose.model("Price", priceSchema);
