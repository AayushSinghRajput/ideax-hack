const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { cleanText } = require("../utils/textCleaner");
const { translateText } = require("./translateService");

const BASE_URL = "https://www.moald.gov.np";

const scrapeMoaldNews = async () => {
  try {
    console.log("🌐 Fetching MoALD homepage...");
    const { data } = await axios.get(BASE_URL, { timeout: 20000 });
    const $ = cheerio.load(data);

    const links = [];

    // Collect links to content pages
    $("a[href^='/content/']").each((_, el) => {
      const titleNP = cleanText($(el).text());
      const href = $(el).attr("href");

      if (titleNP.length > 15) {
        links.push({
          titleNP,
          url: BASE_URL + href,
        });
      }
    });

    console.log(`🔗 Found ${links.length} candidate links`);

    if (!links.length) return [];

    const browser = await puppeteer.launch({ headless: true });
    const news = [];

    for (const item of links.slice(0, 12)) {
      try {
        const page = await browser.newPage();
        await page.goto(item.url, { waitUntil: "networkidle2", timeout: 30000 });

        // Extract visible text
        const descriptionNP = await page.evaluate(() => {
          const body = document.querySelector("body");
          const text = body ? body.innerText : "";
          return text;
        });

        const cleaned = cleanText(descriptionNP);

        if (!cleaned || cleaned.length < 80) {
          console.warn("⚠️ Skipped (empty rendered text):", item.url);
          await page.close();
          continue;
        }

        const titleEN = await translateText(item.titleNP, "en");
        const descriptionEN = await translateText(cleaned, "en");

        news.push({
          titleNP: item.titleNP,
          descriptionNP: cleaned,
          titleEN,
          descriptionEN,
          date: new Date().toISOString().split("T")[0],
          source: "Ministry of Agriculture & Livestock Development, Nepal",
        });

        console.log("✅ Scraped:", item.titleNP);
        await page.close();
      } catch (err) {
        console.warn("⚠️ Failed to scrape:", item.url, err.message);
      }
    }

    await browser.close();

    console.log(`✅ Final news count: ${news.length}`);
    return news;
  } catch (err) {
    console.error("❌ MoALD scraping failed:", err.message);
    return [];
  }
};

module.exports = { scrapeMoaldNews };
