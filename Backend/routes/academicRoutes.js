const express = require("express");
const { createAcademicProjectController, updateAcademicProjectController, getAllAcademicProjectsController, getSingleAcademicProjectController, deleteAcademicProjectController } = require("../controllers/academicController");

  
const router = express.Router();

router.post("/create", createAcademicProjectController);
router.put("/update/:id", updateAcademicProjectController);
router.get("/user/:userId", getAllAcademicProjectsController);
router.get("/view/:id", getSingleAcademicProjectController);
router.delete("/delete/:id", deleteAcademicProjectController);


module.exports = router;
