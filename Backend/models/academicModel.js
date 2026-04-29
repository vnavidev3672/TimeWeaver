const mongoose = require("mongoose");

const facultyAssignmentSchema = new mongoose.Schema(
  {
    lectureTeacher: {
      type: String,
      ref: "Teacher",
      default: null,
    },
    practicalTeacher: {
      type: String,
      ref: "Teacher",
      default: null,
    },
    tutorialTeacher: {
      type: String,
      ref: "Teacher",
      default: null,
    },
  },
  { _id: false },
);

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String },
  lecturesPerWeek: { type: Number, default: 0 },
  tutorialsPerWeek: { type: Number, default: 0 },
  practicalsPerWeek: { type: Number, default: 0 },

  // ✅ ADD THIS
  labRoom: { type: String, default: null },

  assignedTeachers: facultyAssignmentSchema,

  practicalTeachers: [
    {
      batchIndex: Number,
      teacherId: {
        type: String,
        ref: "Teacher",
      },
      labId: {
        type: String,
        ref: "Lab",
      },
    },
  ],
  tutorialTeachers: [
    {
      batchIndex: Number,
      teacherId: {
        type: String,
        ref: "Teacher",
      },
      labId: {
        type: String,
        ref: "Lab",
      },
    },
  ],
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  labId: { type: String, default: null },
});

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  semester: { type: String, required: true },
  lectureHallId: { type: String, default: null }, 
  saturdayProject: { type: Boolean, default: false }, // Added this
  batches: [batchSchema],
  subjects: [subjectSchema],
});

const teacherSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  shortName: { type: String },
});

const academicProjectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    deparmentName: { type: String, required: true },
    academicYear: { type: String, required: true },

    user: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      userName: String,
    },

    totalClasses: { type: Number, default: 1 },

    classes: [classSchema],

    timeSlots: [{ from: String, to: String, type: { type: String } }],
    
    labs: [
      {
        _id: String,
        name: String,
        capacity: Number,
      }
    ],

    lectureHalls: [
      {
        _id: String,
        name: String,
        capacity: Number,
      }
    ],

    teachers: [teacherSchema],

    sessionTypes: {
      lectureDuration: { type: Number, default: 1 },
      tutorialDuration: { type: Number, default: 1 },
      practicalDuration: { type: Number, default: 2 },
    },

    recessSlots: [
      {
        slotIndex: Number,
        label: { type: String, default: "RECESS" },
      },
    ],
  },
  { timestamps: true },
);

const AcademicProject = mongoose.model(
  "AcademicProject",
  academicProjectSchema,
);
module.exports = AcademicProject;
