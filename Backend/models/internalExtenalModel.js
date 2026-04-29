const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  className: String,

  batches: [
    {
      batchName: String,
    },
  ],

  subjects: [
    {
      subjectName: String,
      paperDuration: Number,
    },
  ],

  // ✅ ADD THIS
  teachers: [
    {
      name: String,
    },
  ],

  // ✅ ADD THIS
  locations: [
    {
      name: String,
    },
  ],
});

const internalExternalSchema = new mongoose.Schema({
  projectName: String,

  user: {
    userId: String,
    userName: String,
  },

  totalExamDays: Number,

  examDates: [
    {
      date: String,
      day: String,
    },
  ],

  timeSlots: [
    {
      from: String,
      to: String,
    },
  ],

  classes: [classSchema], // ✅ already exists

  eachDayPaperLimit: {
    minLimit: Number,
    maxLimit: Number,
  },
});

module.exports = mongoose.model("internalExternal", internalExternalSchema);
