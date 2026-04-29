const AcademicProject = require("../models/academicModel");

const createAcademicProjectController = async (req, res) => {
  try {
    const { projectName, deparmentName, user, classes } = req.body;
    if (!projectName || !deparmentName || !user || !classes) {
      return res
        .status(400)
        .send({ success: false, message: "Missing required fields" });
    }

    const project = new AcademicProject({ ...req.body });

    await project.save();

    res.status(201).send({
      success: true,
      message: "Project Created",
      project,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// const updateAcademicProjectController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const updatedProject = await AcademicProject.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true }
//     );

//     if (!updatedProject) {
//       return res.status(404).send({ success: false, message: "Project not found" });
//     }

//     res.status(200).send({
//       success: true,
//       message: "Updated successfully",
//       updatedProject
//     });
//   } catch (error) {
//     res.status(500).send({ success: false, message: error.message });
//   }
// };

const updateAcademicProjectController = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    // ✅ CLEAN CLASSES DATA
    if (updates.classes) {
      updates.classes = updates.classes.map((cls) => ({
        className: cls.className,
        semester: cls.semester,
        lectureHallId: cls.lectureHallId || null,
        saturdayProject: !!cls.saturdayProject,

        // ✅ FIX batches (REMOVE _id)
        batches: (cls.batches || []).map((b) => ({
          batchName: b.batchName,
          labId: b.labId || null,
        })),

        // ✅ FIX subjects
        subjects: (cls.subjects || []).map((sub) => ({
          subjectName: sub.subjectName,
          subjectCode: sub.subjectCode,

          lecturesPerWeek: Number(sub.lecturesPerWeek) || 0,
          tutorialsPerWeek: Number(sub.tutorialsPerWeek) || 0,
          practicalsPerWeek: Number(sub.practicalsPerWeek) || 0,

          labRoom: sub.labRoom || null,

          // ✅ SAFE assignedTeachers
          assignedTeachers: {
            lectureTeacher: sub.assignedTeachers?.lectureTeacher || null,
            practicalTeacher: sub.assignedTeachers?.practicalTeacher || null,
            tutorialTeacher: sub.assignedTeachers?.tutorialTeacher || null,
          },

          // ✅ SAFE practicalTeachers
          practicalTeachers: (sub.practicalTeachers || []).map((p) => ({
            batchIndex: p.batchIndex,
            teacherId: p.teacherId || null,
            labId: p.labId || null,
          })),

          // ✅ SAFE tutorialTeachers
          tutorialTeachers: (sub.tutorialTeachers || []).map((t) => ({
            batchIndex: t.batchIndex,
            teacherId: t.teacherId || null,
            labId: t.labId || null,
          })),
        })),
      }));
    }

    const updatedProject = await AcademicProject.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Updated successfully",
      updatedProject,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const getAllAcademicProjectsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await AcademicProject.find({
      "user.userId": userId,
    }).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      total: projects.length,
      projects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch academic projects",
      error: error.message,
    });
  }
};

const getSingleAcademicProjectController = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await AcademicProject.findById(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Academic project not found",
      });
    }

    res.status(200).send({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch academic project",
      error: error.message,
    });
  }
};

const deleteAcademicProjectController = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await AcademicProject.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Academic project not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Academic project deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to delete academic project",
      error: error.message,
    });
  }
};

module.exports = {
  createAcademicProjectController,
  updateAcademicProjectController,
  getAllAcademicProjectsController,
  getSingleAcademicProjectController,
  deleteAcademicProjectController,
};
