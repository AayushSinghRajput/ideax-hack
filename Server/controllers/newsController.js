const News = require("../models/News");
const { scrapeMoaldNews } = require("../services/moaldScraper");

// Shared save logic
const saveNews = async (news) => {
  if (!news.length) return 0;

  await News.deleteMany({ source: /MoALD/i });
  await News.insertMany(news);

  return news.length;
};

// Manual scrape
const scrapeAndSaveMoald = async (req, res) => {
  try {
    const news = await scrapeMoaldNews();
    const count = await saveNews(news);

    if (!count) {
      return res.status(404).json({ message: "No news found" });
    }

    res.json({
      message: "✅ MoALD news scraped & saved",
      count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Scraping failed",
      error: error.message,
    });
  }
};

// Fetch news
const getAllNews = async (req, res) => {
  try {
    const lang = req.query.lang === "NP" ? "NP" : "EN";
    const news = await News.find().sort({ createdAt: -1 });

    const formattedNews = news.map((n) => ({
      id: n._id,
      title: lang === "EN" ? n.titleEN : n.titleNP,
      description: lang === "EN" ? n.descriptionEN : n.descriptionNP,
      source: n.source,
      date: n.date,
    }));

    res.json(formattedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};

module.exports = { scrapeAndSaveMoald, getAllNews };
