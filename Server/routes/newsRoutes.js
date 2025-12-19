const express = require("express");
const {
  scrapeAndSaveMoald,
  getAllNews,
} = require("../controllers/newsController");

const router = express.Router();

router.post("/scrape/moald", scrapeAndSaveMoald);
router.get("/", getAllNews);

module.exports = router;
