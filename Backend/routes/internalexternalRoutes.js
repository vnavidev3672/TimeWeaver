const express = require("express");

const { createInternalExternalController, getAllInternalExternalController, getSingleInternalExternalController, updateInternalExternalController, deleteInternalExternalController } = require("../controllers/internalExternalController");
 
const router = express.Router();

router.post("/create", createInternalExternalController);
router.get("/user/:userId", getAllInternalExternalController);
router.get("/view/:id", getSingleInternalExternalController);
router.put("/update/:id", updateInternalExternalController);
router.delete("/delete/:id", deleteInternalExternalController);

module.exports = router;
