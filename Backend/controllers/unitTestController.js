const UnitTest = require("../models/unitTestModel");

const createUnitTestController = async (req, res) => {
  try {
    const {
      projectName,
      user_id,
      unitTestDays,
      examDates,
      timeSlots,
      classes,
      eachDayPaperLimit
    } = req.body;

    
    if (
      !projectName ||
      !user_id ||
      !unitTestDays ||
      !examDates ||
      !timeSlots ||
      !classes
    ) {
      return res.status(400).send({
        success: false,
        message: "All required fields must be provided"
      });
    }

     if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one class is required"
      });
    }

     if (examDates.length !== unitTestDays) {
      return res.status(400).send({
        success: false,
        message: "Exam dates count must match unit test days"
      });
    }

     if (
      eachDayPaperLimit &&
      eachDayPaperLimit.minLimit > eachDayPaperLimit.maxLimit
    ) {
      return res.status(400).send({
        success: false,
        message: "minLimit cannot be greater than maxLimit"
      });
    }

    const project = new UnitTest({
      projectName,
      user_id,
      unitTestDays,
      examDates,
      timeSlots,
      classes,
      eachDayPaperLimit
    });

    await project.save();

    res.status(201).send({
      success: true,
      message: "Unit Test project created successfully",
      project
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to create Unit Test project",
      error: error.message
    });
  }
};


const updateUnitTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await UnitTest.findById(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found"
      });
    }

     const allowedFields = [
      "projectName",
      "unitTestDays",
      "examDates",
      "timeSlots",
      "eachDayPaperLimit",
      "classes"
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
         if (key === "eachDayPaperLimit") {
          project.eachDayPaperLimit = {
            ...project.eachDayPaperLimit,
            ...updates.eachDayPaperLimit
          };
        } else {
          project[key] = updates[key];
        }
      }
    });

    await project.save({ validateBeforeSave: true });

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      updatedProject: project
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message || "Failed to update project"
    });
  }
};


const getAllUnitTestController = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await UnitTest.find({ user_id: userId });
    res.status(200).send({
      success: true,
      total: projects.length,
      projects
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch projects",
      error
    });
  }
};

const getSingleUnitTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await UnitTest.findById(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found"
      });
    }
    res.status(200).send({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Failed to fetch project", error });
  }
};

const deleteUnitTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await UnitTest.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).send({ success: false, message: "Project not found" });
    }
    res.status(200).send({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Failed to delete project", error });
  }
};

module.exports = {
  createUnitTestController,
  getAllUnitTestController,
  getSingleUnitTestController,
  updateUnitTestController,
  deleteUnitTestController
};
