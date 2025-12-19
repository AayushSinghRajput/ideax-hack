const { translateText } = require("./translateService");

/**
 * Translate long text in chunks
 */
const translateTextChunks = async (text, targetLang = "en", chunkSize = 500) => {
  if (!text) return "";

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const translatedChunks = [];
  for (const chunk of chunks) {
    const translated = await translateText(chunk, targetLang);
    translatedChunks.push(translated);
  }

  return translatedChunks.join(" ");
};

module.exports = { translateTextChunks };
