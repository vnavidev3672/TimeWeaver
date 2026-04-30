import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../Component/Layout/Layout";
import { useAuth } from "../../context/auth";
import { FaPlus, FaMinus } from "react-icons/fa";

const UpdateProjectInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [auth] = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [unitTestDays, setUnitTestDays] = useState(3);
  const [classesCount, setClassesCount] = useState(1);
  const [timeSlots, setTimeSlots] = useState([{ from: "", to: "" }]);
  const [examDates, setExamDates] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [eachDayPaperLimit, setEachDayPaperLimit] = useState({
    minLimit: 1,
    maxLimit: 1,
  });

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/ie/view/${id}`);
      if (data.success) {
        const project = data.project;

        setProjectName(project.projectName);
        setUnitTestDays(project.totalExamDays);
        setTimeSlots(
          project.timeSlots.length ? project.timeSlots : [{ from: "", to: "" }],
        );
        setClassesCount(project.classes?.length || 1);
        setClassesData(
          project.classes?.length
            ? project.classes.map((c) => ({
                className: c.className,
                batches: c.batches || [],
                subjects: c.subjects || [],
                teachers: c.teachers || [], // ✅ ADD
                locations: c.locations || [], // ✅ ADD
              }))
            : [{ className: "Class 1", batches: [], subjects: [] }],
        );
        setExamDates(
          project.examDates?.length
            ? project.examDates
            : Array(project.totalExamDays).fill({ date: "", day: "" }),
        );
        setEachDayPaperLimit(
          project.eachDayPaperLimit || { minLimit: 1, maxLimit: 1 },
        );
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    setExamDates((prev) => {
      const updated = [...prev];
      if (unitTestDays > updated.length) {
        for (let i = updated.length; i < unitTestDays; i++)
          updated.push({ date: "", day: "" });
      } else updated.length = unitTestDays;
      return updated;
    });
  }, [unitTestDays]);

  useEffect(() => {
    setClassesData((prev) => {
      const updated = [...prev];
      if (classesCount > updated.length) {
        for (let i = updated.length; i < classesCount; i++) {
          updated.push({
            className: `Class ${i + 1}`,
            batches: [],
            subjects: [],
            teachers: [], // ✅ ADD
            locations: [], // ✅ ADD
          });
        }
      } else if (classesCount < updated.length) {
        updated.length = classesCount;
      }
      return updated;
    });
  }, [classesCount]);

  const autoAdjustTimeSlots = (minLimit, maxLimit) => {
    setTimeSlots((prev) => {
      let updated = [...prev];
      if (updated.length < maxLimit) {
        for (let i = updated.length; i < maxLimit; i++)
          updated.push({ from: "", to: "" });
      } else if (updated.length > maxLimit) {
        updated.length = maxLimit;
      }
      return updated;
    });
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };
  const addSlot = () => setTimeSlots([...timeSlots, { from: "", to: "" }]);
  const removeSlot = (index) =>
    setTimeSlots(timeSlots.filter((_, i) => i !== index));

  const handleDateChange = (index, value) => {
    const updated = [...examDates];
    updated[index].date = value;
    updated[index].day = new Date(value).toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (index === 0 && unitTestDays > 1) {
      const confirmAuto = window.confirm(
        "Do you want to automatically fill the next exam dates in sequence?",
      );
      if (confirmAuto) {
        for (let i = 1; i < unitTestDays; i++) {
          const baseDate = new Date(value);
          baseDate.setDate(baseDate.getDate() + i);
          updated[i] = {
            date: baseDate.toISOString().split("T")[0],
            day: baseDate.toLocaleDateString("en-US", { weekday: "long" }),
          };
        }
      }
    }
    setExamDates(updated);
  };

  const handleClassNameChange = (index, value) => {
    const updated = [...classesData];
    updated[index].className = value;
    setClassesData(updated);
  };
  const addSubject = (classIndex) => {
    const updated = [...classesData];
    updated[classIndex].subjects.push({ subjectName: "", paperDuration: 1 });
    setClassesData(updated);
  };
  const removeSubject = (classIndex, subjectIndex) => {
    const updated = [...classesData];
    updated[classIndex].subjects.splice(subjectIndex, 1);
    setClassesData(updated);
  };

  const handleBatchChange = (classIndex, batchIndex, value) => {
    const updated = [...classesData];
    updated[classIndex].batches[batchIndex].batchName = value;
    setClassesData(updated);
  };

  const addBatch = (classIndex) => {
    const updated = [...classesData];
    if (!updated[classIndex].batches) updated[classIndex].batches = [];
    updated[classIndex].batches.push({ batchName: "" });
    setClassesData(updated);
  };

  const removeBatch = (classIndex, batchIndex) => {
    const updated = [...classesData];
    updated[classIndex].batches.splice(batchIndex, 1);
    setClassesData(updated);
  };

  const handleSubjectChange = (classIndex, subjectIndex, field, value) => {
    const updated = [...classesData];
    updated[classIndex].subjects[subjectIndex][field] = value;
    setClassesData(updated);
  };

  // ✅ TEACHERS
  const addTeacher = (classIndex) => {
    const updated = [...classesData];
    if (!updated[classIndex].teachers) updated[classIndex].teachers = [];
    updated[classIndex].teachers.push({ name: "" });
    setClassesData(updated);
  };

  const removeTeacher = (classIndex, teacherIndex) => {
    const updated = [...classesData];
    updated[classIndex].teachers.splice(teacherIndex, 1);
    setClassesData(updated);
  };

  const handleTeacherChange = (classIndex, teacherIndex, value) => {
    const updated = [...classesData];
    updated[classIndex].teachers[teacherIndex].name = value;
    setClassesData(updated);
  };

  // ✅ LOCATIONS
  const addLocation = (classIndex) => {
    const updated = [...classesData];
    if (!updated[classIndex].locations) updated[classIndex].locations = [];
    updated[classIndex].locations.push({ name: "" });
    setClassesData(updated);
  };

  const removeLocation = (classIndex, locationIndex) => {
    const updated = [...classesData];
    updated[classIndex].locations.splice(locationIndex, 1);
    setClassesData(updated);
  };

  const handleLocationChange = (classIndex, locationIndex, value) => {
    const updated = [...classesData];
    updated[classIndex].locations[locationIndex].name = value;
    setClassesData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        projectName,
        totalExamDays: unitTestDays,
        examDates,
        timeSlots,
        classes: classesData,
        eachDayPaperLimit,
      };

      const res = await axios.put(
        `${config.API_BASE_URL}/ie/update/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data.success) {
        alert("Project updated successfully!");
        navigate(`/project/internal-external/view/${id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading project...</p>;

  return (
    <Layout>
      <div className="container form-page-background">
        <div className=" border border-2 border-info mt-4 rounded-4 p-4 form-card fade-in-up">
          <form onSubmit={handleSubmit} className="text-center">
            <h3 className="badge form-badge text-dark">
              Project Name And Author Name
            </h3>
            <div className="d-flex text-start align-items-center mb-4 gap-3 flex-wrap">
              <div className="flex-grow-1">
                <label className="form-label fw-bold">Project Name :</label>
                <input
                  type="text"
                  className="form-control shadow-sm rounded"
                  placeholder="Enter Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="flex-grow-1">
                <label className="form-label fw-bold">Author Name :</label>
                <p className="form-control bg-light text-dark mb-0 shadow-sm rounded">
                  {auth.user.name}
                </p>
              </div>
            </div>

            <hr />
            <h3 className="badge bg-danger bg-opacity-50 text-dark">
              Unit Test Time Slots and pepars Per day{" "}
            </h3>

            <div className="d-flex">
              <div className="col-3">
                <div className="input-group my-2">
                  <span className="input-group-text fw-bold bg-light">
                    Min Papers
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    value={eachDayPaperLimit.minLimit}
                    min={1}
                    onChange={(e) =>
                      setEachDayPaperLimit((prev) => {
                        const newVal = Number(e.target.value);
                        autoAdjustTimeSlots(newVal, prev.maxLimit);
                        return { ...prev, minLimit: newVal };
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold bg-light">
                    Max Papers
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    value={eachDayPaperLimit.maxLimit}
                    min={eachDayPaperLimit.minLimit}
                    onChange={(e) =>
                      setEachDayPaperLimit((prev) => {
                        const newVal = Number(e.target.value);
                        autoAdjustTimeSlots(prev.minLimit, newVal);
                        return { ...prev, maxLimit: newVal };
                      })
                    }
                  />
                </div>
              </div>

              <div className="d-flex flex-column mb-3 col-9">
                {timeSlots.map((slot, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center mb-2 gap-2 ms-5 ps-5"
                  >
                    <strong htmlFor="" className=" text-start">
                      Paper Slot {i + 1} :
                    </strong>
                    <div className=" col-3">
                      <input
                        type="time"
                        className="form-control"
                        value={slot.from}
                        onChange={(e) =>
                          handleSlotChange(i, "from", e.target.value)
                        }
                        required
                      />
                    </div>
                    <span className="fw-bold">to</span>
                    <div className="col-3">
                      <input
                        type="time"
                        className="form-control"
                        value={slot.to}
                        onChange={(e) =>
                          handleSlotChange(i, "to", e.target.value)
                        }
                        required
                      />
                    </div>
                    {i === 0 ? (
                      <button
                        type="button"
                        className="badge btn border bg-light text-success"
                        onClick={addSlot}
                      >
                        <FaPlus />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="badge btn border bg-light text-danger"
                        onClick={() => removeSlot(i)}
                      >
                        <FaMinus />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr />
            <h3 className="badge bg-info bg-opacity-50 text-dark">
              Exam Days{" "}
            </h3>
            <div className="d-flex gap-4">
              <div className="col-3">
                <div className="input-group">
                  <label className="input-group-text fw-bold bg-light">
                    Exam days :
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Unit Test Days"
                    value={unitTestDays}
                    min={1}
                    max={10}
                    onChange={(e) => setUnitTestDays(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="col-9">
                {examDates.map((item, index) => (
                  <div
                    key={index}
                    className="row align-items-center mb-2 py- rounded-2"
                  >
                    <div className="col-2 text-center fw-bold text-muted">
                      Day {index + 1}
                    </div>
                    <div className="col-3">
                      <input
                        type="date"
                        className="form-control"
                        value={item.date}
                        onChange={(e) =>
                          handleDateChange(index, e.target.value)
                        }
                      />
                    </div>
                    <div className="col-3">
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={item.day}
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr />
            <h3 className="badge bg-primary bg-opacity-50 text-dark">
              Class and Subjects{" "}
            </h3>

            <div className="input-group my-2">
              <label className="input-group-text fw-bold bg-light">
                {" "}
                Total Classes :{" "}
              </label>
              <input
                type="number"
                className="form-control"
                value={classesCount}
                min={1}
                onChange={(e) => setClassesCount(Number(e.target.value))}
              />
            </div>

            <table className="table table-bordered">
              <thead>
                <tr className="text-start">
                  <th>Class Info</th>
                  <th>Class Wise Batches</th>
                  <th>Class Wise Subjects</th>
                  <th>Faculty</th> {/* ✅ ADD */}
                  <th>Location</th> {/* ✅ ADD */}
                </tr>
              </thead>
              <tbody>
                {classesData.map((cls, ci) => (
                  <tr key={ci}>
                    <td>
                      <input
                        className="form-control"
                        value={cls.className}
                        onChange={(e) =>
                          handleClassNameChange(ci, e.target.value)
                        }
                      />
                    </td>

                    <td className="text-start">
                      {cls.batches.map((b, bi) => (
                        <div key={bi} className="d-flex gap-2 mb-1 text-start">
                          <input
                            className="form-control"
                            value={b.batchName}
                            onChange={(e) =>
                              handleBatchChange(ci, bi, e.target.value)
                            }
                            placeholder="Batch Name"
                          />
                          <button
                            type="button"
                            onClick={() => removeBatch(ci, bi)}
                            className="badge bg-danger"
                          >
                            <FaMinus />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="badge bg-success "
                        onClick={() => addBatch(ci)}
                      >
                        <FaPlus /> Add Batch
                      </button>
                    </td>

                    <td className="text-start">
                      {cls.subjects.map((s, si) => (
                        <div key={si} className="d-flex gap-2 mb-1">
                          <input
                            className="form-control"
                            placeholder="Subject Name"
                            value={s.subjectName}
                            onChange={(e) =>
                              handleSubjectChange(
                                ci,
                                si,
                                "subjectName",
                                e.target.value,
                              )
                            }
                          />
                          <input
                            type="number"
                            className="form-control"
                            value={s.paperDuration}
                            min={0.5}
                            step={0.5}
                            onChange={(e) =>
                              handleSubjectChange(
                                ci,
                                si,
                                "paperDuration",
                                Number(e.target.value),
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeSubject(ci, si)}
                            className="badge bg-danger"
                          >
                            <FaMinus />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="badge bg-success "
                        onClick={() => addSubject(ci)}
                      >
                        <FaPlus /> Add Subject
                      </button>
                    </td>
                    {/* ✅ TEACHERS */}
                    <td className="text-start">
                      {(cls.teachers || []).map((t, ti) => (
                        <div key={ti} className="d-flex gap-2 mb-1">
                          <input
                            className="form-control"
                            placeholder="Teacher Name"
                            value={t?.name || ""}
                            onChange={(e) =>
                              handleTeacherChange(ci, ti, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeTeacher(ci, ti)}
                            className="badge bg-danger"
                          >
                            <FaMinus />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="badge bg-success"
                        onClick={() => addTeacher(ci)}
                      >
                        <FaPlus /> Add Teacher
                      </button>
                    </td>

                    {/* ✅ LOCATIONS */}
                    <td className="text-start">
                      {(cls.locations || []).map((l, li) => (
                        <div key={li} className="d-flex gap-2 mb-1">
                          <input
                            className="form-control"
                            placeholder="Lab / Hall"
                            value={l?.name || ""}
                            onChange={(e) =>
                              handleLocationChange(ci, li, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeLocation(ci, li)}
                            className="badge bg-danger"
                          >
                            <FaMinus />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="badge bg-success"
                        onClick={() => addLocation(ci)}
                      >
                        <FaPlus /> Add Location
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-success btn-sm btn-cta"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProjectInfo;
