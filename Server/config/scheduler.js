const cron = require("node-cron");
const scrapeDailyPrices = require("../services/scraper.service");

function startScheduler() {
  // Runs every day at 6 AM Nepal time
  cron.schedule("0 6 * * *", async () => {
    console.log("⏰ Running daily price scraper...");
    try {
      await scrapeDailyPrices();
    } catch (err) {
      console.error("❌ Scraping failed:", err.message);
    }
  });
}

module.exports = startScheduler;
