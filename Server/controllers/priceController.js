const scrapeDailyPrices = require("../services/scraper.service");
const {
  getLatestPrices,
  getWeeklyTrend,
} = require("../services/trend.service");

// POST /api/prices/scrape
const scrapePrices = async (req, res) => {
  try {
    await scrapeDailyPrices();
    res.status(200).json({
      message: "Prices scraped successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET /api/prices/today
const getTodayPrices = async (req, res) => {
  try {
    const prices = await getLatestPrices();
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET /api/prices/trend/weekly?commodity_np=...
const getWeeklyPriceTrend = async (req, res) => {
  try {
    const { commodity_np } = req.query;

    if (!commodity_np) {
      return res.status(400).json({
        message: "commodity_np is required",
      });
    }

    const trend = await getWeeklyTrend(commodity_np);
    res.status(200).json(trend);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  scrapePrices,
  getTodayPrices,
  getWeeklyPriceTrend,
};
