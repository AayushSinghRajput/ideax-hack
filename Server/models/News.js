const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    titleEN: { type: String, required: true },
    descriptionEN: { type: String, required: true },
    titleNP: { type: String, required: true },
    descriptionNP: { type: String, required: true },
    source: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
