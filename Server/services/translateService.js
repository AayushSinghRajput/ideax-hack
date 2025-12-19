const axios = require("axios");

/**
 * Translate a single string using Google Translate public API
 */
const translateText = async (text, targetLang = "en") => {
  try {
    if (!text) return "";

    const url = "https://translate.googleapis.com/translate_a/single";

    const { data } = await axios.get(url, {
      params: {
        client: "gtx",
        sl: "auto",
        tl: targetLang,
        dt: "t",
        q: text,
      },
      timeout: 10000,
    });

    return data[0].map(t => t[0]).join("");
  } catch (error) {
    console.error("❌ Translation failed:", error.message);
    return text; // fallback
  }
};

module.exports = { translateText };
