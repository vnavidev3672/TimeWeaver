import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../Component/Layout/Layout";
import "../../Styles/FormStyle.css";
import { useAuth } from "../../context/auth";
import {
  FaPlus,
  FaMinus
} from "react-icons/fa";

const CreateProjectInfo = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [projectName, setProjectName] = useState("");
  const [unitTestDays, setUnitTestDays] = useState(3);
  const [classesCount, setClassesCount] = useState(1);
  const [timeSlots, setTimeSlots] = useState([{ from: "", to: "" }]);
  const [examDates, setExamDates] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [eachDayPaperLimit, setEachDayPaperLimit] = useState({ minLimit: 1, maxLimit: 1 });

  useEffect(() => {
    setExamDates(prev => {
      const updated = [...prev];
      if (unitTestDays > updated.length) {
        for (let i = updated.length; i < unitTestDays; i++) updated.push({ date: "", day: "" });
      } else updated.length = unitTestDays;
      return updated;
    });
  }, [unitTestDays]);

  useEffect(() => {
    setClassesData(prev => {
      const updated = [...prev];
      if (classesCount > updated.length) {
        for (let i = updated.length; i < classesCount; i++) {
          updated.push({ className: `Class ${i + 1}`, subjects: [] });
        }
        setMessage(`${classesCount - prev.length} class(es) added`);
      } else if (classesCount < updated.length) {
        updated.length = classesCount;
        setMessage(`Class count updated to ${classesCount}`);
      }
      return updated;
    });
  }, [classesCount]);

  const autoAdjustTimeSlots = (minLimit, maxLimit) => {
    setTimeSlots(prev => {
      let updated = [...prev];
      if (updated.length < maxLimit) {
        for (let i = updated.length; i < maxLimit; i++) updated.push({ from: "", to: "" });
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
  const removeSlot = index => setTimeSlots(timeSlots.filter((_, i) => i !== index));

  const handleDateChange = (index, value) => {
    const updated = [...examDates];
    updated[index].date = value;
    updated[index].day = new Date(value).toLocaleDateString("en-US", { weekday: "long" });

    if (index === 0 && unitTestDays > 1) {
      const confirmAuto = window.confirm("Do you want to automatically fill the next exam dates in sequence?");
      if (confirmAuto) {
        for (let i = 1; i < unitTestDays; i++) {
          const baseDate = new Date(value);
          baseDate.setDate(baseDate.getDate() + i);
          updated[i] = { date: baseDate.toISOString().split("T")[0], day: baseDate.toLocaleDateString("en-US", { weekday: "long" }) };
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
  const handleSubjectChange = (classIndex, subjectIndex, value) => {
    const updated = [...classesData];
    updated[classIndex].subjects[subjectIndex].subjectName = value;
    setClassesData(updated);
  };
  const addSubject = classIndex => {
    const updated = [...classesData];
    updated[classIndex].subjects.push({ subjectName: "", paperDuration: 1 });
    setClassesData(updated);
  };
  const removeSubject = (classIndex, subjectIndex) => {
    const updated = [...classesData];
    updated[classIndex].subjects.splice(subjectIndex, 1);
    setClassesData(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        projectName,
        user_id: auth?.user?._id,
        unitTestDays,
        examDates,
        timeSlots,
        classes: classesData,
        eachDayPaperLimit
      };

      const res = await axios.post(
        `${config.API_BASE_URL}/ut/create`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        alert("Project created successfully!");
        navigate(`/project/unit-test/view/${res.data.project._id}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Layout>
      <div className="container">

        <div className="page-title-wrapper mt-0">
          <h2 className="page-title">
            Create New <span>Unit Test</span> Project
          </h2>
        </div>

        <div className=" border mt-4 rounded-4 p-4 shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="text-center">

            <div className="section-card mb-4">
              <div className="section-header">
                <h4 className=" ">
                  Project <span>Details</span>
                </h4>
              </div>

              <div className="row g-4 mt-2">
                <div className="col-md-6">
                  <label className="form-label custom-label text-start">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="Enter Project Name"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label custom-label text-start">
                    Author Name
                  </label>
                  <input
                    type="text"
                    className="form-control custom-input bg-light"
                    value={auth.user.name}
                    readOnly
                  />
                </div>

              </div>
            </div>

            <div className="section-card mb-4">
              <div className="section-header">
                <h4>
                  Unit Test <span>Time & Paper Limits</span>
                </h4>
              </div>

              <div className="d-flex">
                <div className="col-md-4">
                  <label className="custom-label text-start">Minimum Papers Per Day</label>
                  <input
                    type="number"
                    className="form-control custom-input mb-3"
                    value={eachDayPaperLimit.minLimit}
                    min={1}
                    onChange={e =>
                      setEachDayPaperLimit(prev => {
                        const newVal = Number(e.target.value);
                        autoAdjustTimeSlots(newVal, prev.maxLimit);
                        return { ...prev, minLimit: newVal };
                      })
                    }
                  />

                  <label className="custom-label text-start">Maximum Papers Per Day</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={eachDayPaperLimit.maxLimit}
                    min={eachDayPaperLimit.minLimit}
                    onChange={e =>
                      setEachDayPaperLimit(prev => {
                        const newVal = Number(e.target.value);
                        autoAdjustTimeSlots(prev.minLimit, newVal);
                        return { ...prev, maxLimit: newVal };
                      })
                    }
                  />

                </div>

                <div className="vertical-divider mx-3">.</div>

                <div className="col-md-8">

                  {timeSlots.map((slot, i) => (
                    <div className="slot-row p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong style={{ color: "#0dcaf0" }}>Paper Slot {i + 1}</strong>
                        {i === 0 ? (
                          <button type="button" className="btn btn-outline-success btn-sm" onClick={addSlot}><FaPlus /></button>
                        ) : (
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeSlot(i)}><FaMinus /></button>
                        )}
                      </div>
                      <div className="row g-2">
                        <div className="col-md-5">
                          <input type="time" className="custom-input" value={slot.from} onChange={e => handleSlotChange(i, "from", e.target.value)} />
                        </div>
                        <div className="col-md-5">
                          <input type="time" className="custom-input" value={slot.to} onChange={e => handleSlotChange(i, "to", e.target.value)} />
                        </div>
                      </div>
                    </div>

                  ))}

                </div>
              </div>
            </div>

            <hr />
            <div className="section-card">
              <div className="section-header mb-3">
                <h4>Exam Days</h4>
              </div>

              <div className="d-flex">
                <div className="col-md-3">
                  <label className="custom-label text-start">Total Exam Days</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={unitTestDays}
                    min={1}
                    max={10}
                    onChange={e => setUnitTestDays(Number(e.target.value))}
                    placeholder="Unit Test Days"
                    required
                  />
                </div>

                <div className="vertical-divider mx-3">.</div>


                <div className="col-md-9">
                  {examDates.map((item, index) => (
                    <div key={index} className="slot-row d-flex align-items-center mb-2 p-2 rounded">
                      <div className="col-2 text-center fw-bold text-muted">Day {index + 1}</div>
                      <div className="col-3">
                        <input
                          type="date"
                          className="custom-input"
                          value={item.date}
                          onChange={e => handleDateChange(index, e.target.value)}
                        />
                      </div>
                      <div className="col-3 ms-2">
                        <input
                          type="text"
                          className="custom-input bg-light"
                          value={item.day}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr />

            <div className="section-card mt-3">
              <div className="section-header mb-3">
                <h4>Classes & Subjects</h4>
              </div>

              <div className="d-flex">
                <div className="col-md-2">
                  <label className="custom-label text-start">Total Classes</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={classesCount}
                    min={1}
                    onChange={e => setClassesCount(Number(e.target.value))}
                    placeholder="Total Classes"
                    required
                  />
                </div>

                <div className="vertical-divider mx-3">.</div>

                <div className="col-md-10">
                  {classesData.map((cls, classIndex) => (
                    <div key={classIndex} className="slot-row p-3 mb-3 rounded">
                      <div className="mb-2 d-flex">
                        <div className="col-2">
                          <label className="custom-label text-start">Class Name</label>
                        </div>
                        <div className="col-3 me-2">
                          <input
                            type="text"
                            className="custom-input"
                            value={cls.className}
                            onChange={e => handleClassNameChange(classIndex, e.target.value)}
                            placeholder="Enter Class Name"
                          />
                        </div>


                        <div className="col-4 ">
                          {cls.subjects.map((subj, subjectIndex) => (
                            <div key={subjectIndex} className="d-flex me-2 mb-2">
                              <input
                                type="text"
                                className="custom-input flex-grow-1"
                                placeholder="Subject Name"
                                value={subj.subjectName}
                                onChange={e => handleSubjectChange(classIndex, subjectIndex, e.target.value)}
                                required
                              />
                              <input
                                type="number"
                                className="custom-input ms-2 me-2"
                                placeholder="Duration (hr)"
                                min={0.5}
                                step={0.5}
                                value={subj.paperDuration}
                                onChange={e => {
                                  const updated = [...classesData];
                                  updated[classIndex].subjects[subjectIndex].paperDuration = Number(e.target.value);
                                  setClassesData(updated);
                                }}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeSubject(classIndex, subjectIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}


                        </div>


                        <div className="">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => addSubject(classIndex)}
                          >
                            <FaPlus /> Add Subject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>


            <div className="text-center mt-3">
              <button className="btn btn-success px-5" disabled={saving}>
                {saving ? "Creating..." : "Create Project"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProjectInfo;
