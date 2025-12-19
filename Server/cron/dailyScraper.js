const cron = require("node-cron");
const News = require("../models/News");
const { scrapeMoaldNews } = require("../services/moaldScraper");

cron.schedule(
  "0 6 * * *",
  async () => {
    try {

      const news = await scrapeMoaldNews();
      if (!news.length) return;

      await News.deleteMany({ source: /MoALD/i });
      await News.insertMany(news);
    } catch (error) {
      console.error("❌ Daily scrape failed:", error.message);
    }
  },
  { timezone: "Asia/Kathmandu" }
);
