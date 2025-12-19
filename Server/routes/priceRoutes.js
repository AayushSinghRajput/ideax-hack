const express = require("express");
const router = express.Router();

const {
  scrapePrices,
  getTodayPrices,
  getWeeklyPriceTrend,
} = require("../controllers/priceController");

router.post("/scrape", scrapePrices);
router.get("/today", getTodayPrices);
router.get("/trend/weekly", getWeeklyPriceTrend);

module.exports = router;
