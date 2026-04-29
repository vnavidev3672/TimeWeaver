const express = require("express");

const {
  createUnitTestController,
  getAllUnitTestController,
  getSingleUnitTestController,
  updateUnitTestController,
  deleteUnitTestController
} = require("../controllers/unitTestController");

const router = express.Router();

router.post("/create", createUnitTestController);
router.get("/user/:userId", getAllUnitTestController);
router.get("/view/:id", getSingleUnitTestController);
router.put("/update/:id", updateUnitTestController);
router.delete("/delete/:id", deleteUnitTestController);

module.exports = router;
