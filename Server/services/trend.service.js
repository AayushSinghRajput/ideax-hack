const Price = require("../models/Price");

async function getWeeklyTrend(commodity_np) {
  return Price.find({ commodity_np }).sort({ date: -1 }).limit(7).lean();
}

async function getLatestPrices() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Price.find({ date: today }).lean();
}

module.exports = {
  getWeeklyTrend,
  getLatestPrices,
};
