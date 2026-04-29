const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectName: String,
  paperDuration: Number
});

const classSchema = new mongoose.Schema({
  className: String,
  subjects: [subjectSchema]
});

const collegeSlotSchema = new mongoose.Schema({
  from: String,
  to: String
});

const examDateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  }
});

const projectSchema = new mongoose.Schema(
  {
    projectName: String,

    // deparmentName: { type: String, required: true },
    // academicYear: { type: String, required: true },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },

    unitTestDays: {
      type: Number,
      min: 1,
      max: 10
    },

    examDates: {
      type: [examDateSchema]
    },

    timeSlots: {
      type: [collegeSlotSchema]
    },

    eachDayPaperLimit: {
      minLimit: {
        type: Number,
        min: 1
      },
      maxLimit: {
        type: Number,
        max: 6
      }
    },

    classes: {
      type: [classSchema]
    }
  },
  { timestamps: true }
);

const Project = mongoose.model("unitTest", projectSchema);
module.exports = Project;
