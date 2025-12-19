const router = require("express").Router();
const prebookingController = require("../controllers/prebookingController");

router.post("/create", prebookingController.createPrebooking);
router.get("/user/:user_id", prebookingController.getUserPrebookings);
router.patch("/update-status", prebookingController.updatePrebookingStatus);

module.exports = router;
