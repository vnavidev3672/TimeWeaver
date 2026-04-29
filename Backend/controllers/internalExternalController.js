const internalExtenalModel = require("../models/internalExtenalModel");

const createInternalExternalController = async (req, res) => {
  try {
    const {
      projectName,
      user,
      totalExamDays,
      examDates,
      timeSlots,
      classes,
      eachDayPaperLimit,
    } = req.body;

    if (!projectName || !user || !totalExamDays || !timeSlots || !classes) {
      return res.status(400).send({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one class is required",
      });
    }

    if (examDates && examDates.length !== totalExamDays) {
      return res.status(400).send({
        success: false,
        message: "Exam dates count must match total exam days",
      });
    }

    if (
      eachDayPaperLimit &&
      eachDayPaperLimit.minLimit > eachDayPaperLimit.maxLimit
    ) {
      return res.status(400).send({
        success: false,
        message: "minLimit cannot be greater than maxLimit",
      });
    }

    for (const cls of classes) {
      if (!cls.className || !Array.isArray(cls.subjects)) {
        return res.status(400).send({
          success: false,
          message: "Each class must have className and subjects",
        });
      }
    }

    const project = new internalExtenalModel({
      projectName,
      user,
      totalExamDays,
      examDates,
      timeSlots,
      classes,
      eachDayPaperLimit,
    });

    await project.save();

    res.status(201).send({
      success: true,
      message: "Exam project created successfully",
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to create exam project",
      error: error.message,
    });
  }
};

const updateInternalExternalController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await internalExtenalModel.findById(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    const allowedFields = [
      "projectName",
      "totalExamDays",
      "examDates",
      "timeSlots",
      "eachDayPaperLimit",
      "classes",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === "eachDayPaperLimit") {
          project.eachDayPaperLimit = {
            ...project.eachDayPaperLimit,
            ...updates.eachDayPaperLimit,
          };
        } else {
          project[key] = updates[key];
        }
      }
    });

    await project.save({ validateBeforeSave: true });

    res.status(200).send({
      success: true,
      message: "Exam project updated successfully",
      updatedProject: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message || "Failed to update project",
    });
  }
};

const getAllInternalExternalController = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await internalExtenalModel.find({
      "user.userId": userId,
    });

    res.status(200).send({
      success: true,
      total: projects.length,
      projects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch projects",
      error,
    });
  }
};

const getSingleInternalExternalController = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await internalExtenalModel.findById(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).send({
      success: true,
      project,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch project",
      error,
    });
  }
};

const deleteInternalExternalController = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await internalExtenalModel.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to delete project",
      error,
    });
  }
};

module.exports = {
  createInternalExternalController,
  updateInternalExternalController,
  getAllInternalExternalController,
  getSingleInternalExternalController,
  deleteInternalExternalController,
};
