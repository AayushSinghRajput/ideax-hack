                                                        const axios = require("axios");
const cheerio = require("cheerio");
const Price = require("../models/Price");
const nepaliToEnglish = require("../utils/nepaliNumber");

const URL = "https://kalimatimarket.gov.np/";

async function scrapeDailyPrices() {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prices = [];

  $("table tbody tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length !== 4) return;

    const commodity_np = $(cols[0]).text().trim();
    const min = Number(nepaliToEnglish($(cols[1]).text()));
    const max = Number(nepaliToEnglish($(cols[2]).text()));
    const avg = Number(nepaliToEnglish($(cols[3]).text()));

    if (!commodity_np || isNaN(min)) return;

    prices.push({
      commodity_np,
      min,
      max,
      avg,
      date: today,
    });
  });

  // Avoid duplicate insert for same day
  await Price.deleteMany({ date: today });
  await Price.insertMany(prices);

  console.log(`📊 ${prices.length} prices saved for ${today.toDateString()}`);
}

module.exports = scrapeDailyPrices;
