import React, { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../Component/Layout/Layout";
import "../../Styles/FormTheme.css";
import { useAuth } from "../../context/auth";
import { FaPlus, FaMinus } from "react-icons/fa";
import toast from "react-hot-toast";

const CreateProjectInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [auth] = useAuth();

  // helper to generate a 24-char hex id like a Mongo ObjectId for client-side subdocuments
  const makeObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = Array.from({ length: 16 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
    return (timestamp + random).slice(0, 24);
  };
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [deparmentName, setDeparmentName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [classesCount, setClassesCount] = useState(1);
  const [classesData, setClassesData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([{ from: "", to: "" }]);
  const [recessSlots, setRecessSlots] = useState([]);
  const [labs, setLabs] = useState([]);
  const [lectureHalls, setLectureHalls] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState("main");
  const [hallTabFlash, setHallTabFlash] = useState(false);

  const [sessionTypes, setSessionTypes] = useState({
    lectureDuration: 1,
    tutorialDuration: 1,
    practicalDuration: 2,
  });

  useEffect(() => {
    setClassesData((prev) => {
      const updated = [...prev];
      if (classesCount > updated.length) {
        for (let i = updated.length; i < classesCount; i++) {
          updated.push({ className: `Class ${i + 1}`, subjects: [] });
        }
      } else {
        updated.length = classesCount;
      }
      return updated;
    });
  }, [classesCount]);

  const addSubject = (classIndex) => {
    const updated = [...classesData];
    updated[classIndex].subjects.push({
      subjectName: "",
      subjectCode: "",
      lecturesPerWeek: 0,
      practicalsPerWeek: 0,
      tutorialsPerWeek: 0,
      assignedTeachers: {
        lectureTeacher: "",
        practicalTeacher: "",
        tutorialTeacher: "",
      },
      sameBatchPractical: false,
    });
    setClassesData(updated);
  };

  const removeSubject = (classIndex, subjectIndex) => {
    const updated = [...classesData];
    updated[classIndex].subjects.splice(subjectIndex, 1);
    setClassesData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isValidId = (id) => {
        const s = String(id || "");
        return s.length === 24 && /^[0-9a-fA-F]{24}$/.test(s);
      };

      const payload = {
        projectName,
        deparmentName,
        timeSlots,
        lectureHalls,
        labs,
        academicYear,
        academicSession,
        totalClasses: Number(classesCount),
        teachers: teachers.map((t) => ({
          _id: t._id,
          teacherName: t.teacherName,
          shortName: t.shortName,
          locationLabId: t.locationLabId || undefined,
        })),
        recessSlots,
        sessionTypes,
        user: {
          userId: auth?.user?._id,
          userName: auth?.user?.name,
        },
        classes: classesData.map((cls) => ({
          className: cls.className,
          semester: cls.semester || "I",
          saturdayProject: cls.saturdayProject || false,
          batches: cls.batches || [],
          lectureHallId: cls.lectureHallId || undefined,
          subjects: cls.subjects.map((sub) => {
            const teachersData = {};
            if (isValidId(sub.assignedTeachers?.lectureTeacher))
              teachersData.lectureTeacher = sub.assignedTeachers.lectureTeacher;
            if (isValidId(sub.assignedTeachers?.practicalTeacher))
              teachersData.practicalTeacher =
                sub.assignedTeachers.practicalTeacher;
            if (isValidId(sub.assignedTeachers?.tutorialTeacher))
              teachersData.tutorialTeacher =
                sub.assignedTeachers.tutorialTeacher;

            const practicalTeachers = (sub.practicalTeachers || [])
              .map((p) => ({
                batchIndex: p.batchIndex,
                teacherId: isValidId(p.teacherId) ? p.teacherId : undefined,
              }))
              .filter((p) => p.teacherId);

            const tutorialTeachers = (sub.tutorialTeachers || [])
              .map((p) => ({
                batchIndex: p.batchIndex,
                teacherId: isValidId(p.teacherId) ? p.teacherId : undefined,
                labId: isValidId(p.labId) ? p.labId : undefined,
              }))
              .filter((p) => p.teacherId || p.labId);

            return {
              subjectName: sub.subjectName,
              labRoom: sub.labRoom || undefined,
              lecturesPerWeek: Number(sub.lecturesPerWeek) || 0,
              practicalsPerWeek: Number(sub.practicalsPerWeek) || 0,
              tutorialsPerWeek: Number(sub.tutorialsPerWeek) || 0,
              sameBatchPractical: !!sub.sameBatchPractical,
              assignedTeachers:
                Object.keys(teachersData).length > 0 ? teachersData : undefined,
              practicalTeachers:
                practicalTeachers.length > 0 ? practicalTeachers : undefined,
              tutorialTeachers:
                tutorialTeachers.length > 0 ? tutorialTeachers : undefined,
            };
          }),
        })),
      };

      const { data } = await axios.post(
        `${config.API_BASE_URL}/ac/create`,
        payload,
      );

      if (data.success) {
        toast.success("Project Added Successfully!");
        navigate(`/project/academic/view/${data.project._id}`);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to add project.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container form-page-background">
        <div className="card shadow-lg border-info rounded-4 p-4 form-card fade-in-up">
          <form onSubmit={handleSubmit}>
            <div className=" mb-5 text-center">
              <span
                className="badge rounded-pill form-badge px-4 py-2 shadow-sm"
                style={{ fontSize: "1.1rem" }}
              >
                ACADEMIC TIME TABLE UPDATE
              </span>
            </div>

            <div className="row mb-4 g-3">
              <div className="col-md-3">
                <label className="form-label fw-bold">Project Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Department Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={deparmentName}
                  onChange={(e) => setDeparmentName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Academic Year</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2024-25"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Total Classes</label>
                <input
                  type="number"
                  className="form-control bg-light"
                  value={classesCount}
                  onChange={(e) => setClassesCount(Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>
            {/* Tabs: Main / Labs / Lecture Halls */}
            <div className="mb-3">
              <div className="btn-group" role="group" aria-label="form tabs">
                <button
                  type="button"
                  className={
                    "btn " +
                    (activeTab === "main"
                      ? "btn-primary"
                      : "btn-outline-primary")
                  }
                  onClick={() => setActiveTab("main")}
                >
                  Main
                </button>
                <button
                  type="button"
                  className={
                    "btn " +
                    (activeTab === "labs"
                      ? "btn-primary"
                      : "btn-outline-primary")
                  }
                  onClick={() => setActiveTab("labs")}
                >
                  Labs
                </button>
                <button
                  type="button"
                  className={
                    "btn " +
                    (activeTab === "halls"
                      ? "btn-primary"
                      : hallTabFlash
                        ? "btn-warning"
                        : "btn-outline-primary")
                  }
                  onClick={() => setActiveTab("halls")}
                >
                  Lecture Halls
                </button>
                {/* <button
                  type="button"
                  className={
                    "btn " +
                    (activeTab === "batch"
                      ? "btn-primary"
                      : "btn-outline-primary")
                  }
                  onClick={() => setActiveTab("batch")}
                >
                  Batch Labs
                </button> */}
              </div>
            </div>

            {activeTab === "halls" && (
              <div className="section-card p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold">Lecture Halls</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-cta px-3 rounded-pill text-white"
                    onClick={() =>
                      setLectureHalls([
                        ...lectureHalls,
                        { _id: makeObjectId(), name: "Hall-", capacity: 100 },
                      ])
                    }
                  >
                    <FaPlus className="me-1" /> Add Hall
                  </button>
                </div>
                <div className="row g-2">
                  {lectureHalls.map((l, li) => (
                    <div key={li} className="col-md-4 mb-2">
                      <div className="input-group input-group-sm">
                        <input
                          className="form-control form-control-sm"
                          value={l.name}
                          onChange={(e) => {
                            const a = [...lectureHalls];
                            a[li].name = e.target.value;
                            setLectureHalls(a);
                          }}
                        />
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          value={l.capacity}
                          onChange={(e) => {
                            const a = [...lectureHalls];
                            a[li].capacity = Number(e.target.value || 0);
                            setLectureHalls(a);
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            setLectureHalls(
                              lectureHalls.filter((_, j) => j !== li),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "batch" && (
              <div className="section-card p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold">
                    Batch Lab Allocation & Timings
                  </label>
                  <div>
                    <small className="text-muted">
                      Set per-batch lab and session durations (hours)
                    </small>
                  </div>
                </div>

                <div className="row g-3">
                  {classesData.map((cls, ci) => (
                    <div key={ci} className="col-12 mb-3">
                      <div className="card p-3 shadow-sm">
                        <div className="fw-bold mb-2">{cls.className}</div>
                        <div className="d-flex flex-wrap gap-2">
                          {(cls.batches || []).map((bt, bi) => (
                            <div
                              key={bi}
                              className="input-group input-group-sm"
                              style={{ width: 360 }}
                            >
                              <span className="input-group-text bg-light">
                                {bt.batchName || `B${bi + 1}`}
                              </span>

                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Prac hrs"
                                value={
                                  bt.practicalDuration ??
                                  sessionTypes.practicalDuration
                                }
                                onChange={(e) => {
                                  const d = [...classesData];
                                  if (!d[ci].batches) d[ci].batches = [];
                                  d[ci].batches[bi] = {
                                    ...d[ci].batches[bi],
                                    practicalDuration:
                                      Number(e.target.value) || 0,
                                  };
                                  setClassesData(d);
                                }}
                                style={{ width: 90 }}
                              />
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Tut hrs"
                                value={
                                  bt.tutorialDuration ??
                                  sessionTypes.tutorialDuration
                                }
                                onChange={(e) => {
                                  const d = [...classesData];
                                  if (!d[ci].batches) d[ci].batches = [];
                                  d[ci].batches[bi] = {
                                    ...d[ci].batches[bi],
                                    tutorialDuration:
                                      Number(e.target.value) || 0,
                                  };
                                  setClassesData(d);
                                }}
                                style={{ width: 90 }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <hr />

            {classesData.map((cls, cIdx) => (
              <div key={cIdx} className="section-card p-4 mb-4">
                <div className="row g-3 mb-4 ">
                  <div className="col-md-2">
                    <label className="form-label fw-bold text-primary small text-uppercase">
                      Class Name
                    </label>
                    <input
                      type="text"
                      className="form-control fw-bold border-primary shadow-sm"
                      placeholder="e.g. BE-CSE-A"
                      value={cls.className}
                      onChange={(e) => {
                        const d = [...classesData];
                        d[cIdx].className = e.target.value;
                        setClassesData(d);
                      }}
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label fw-bold text-primary small text-uppercase">
                      Semester
                    </label>
                    <select
                      className="form-select border-primary shadow-sm"
                      value={cls.semester || ""}
                      onChange={(e) => {
                        const d = [...classesData];
                        d[cIdx].semester = e.target.value;
                        setClassesData(d);
                      }}
                    >
                      <option value="">Select Semester</option>
                      <option value="I">Semester I</option>
                      <option value="II">Semester II</option>
                      <option value="III">Semester III</option>
                      <option value="IV">Semester IV</option>
                      <option value="V">Semester V</option>
                      <option value="VI">Semester VI</option>
                      <option value="VII">Semester VII</option>
                      <option value="VIII">Semester VIII</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <div className="d-flex align-items-center">
                      <label className="form-label fw-bold text-primary small text-uppercase mb-0">
                        Lecture Hall
                      </label>
                      <button
                        type="button"
                        className="btn btn-link btn-sm ms-2 p-0"
                        title="Manage Lecture Halls"
                        onClick={() => {
                          setActiveTab("halls");
                          setHallTabFlash(true);
                          // scroll to top so the tabs are visible
                          try {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          } catch (e) {}
                          setTimeout(() => setHallTabFlash(false), 1400);
                        }}
                      >
                        <small className="text-primary">Manage</small>
                      </button>
                    </div>
                    {lectureHalls && lectureHalls.length > 0 ? (
                      <select
                        className="form-select border-primary shadow-sm"
                        value={cls.lectureHallId || ""}
                        onChange={(e) => {
                          const d = [...classesData];
                          d[cIdx].lectureHallId = e.target.value || null;
                          setClassesData(d);
                        }}
                      >
                        <option value="">-- select hall --</option>
                        {lectureHalls.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.name} (cap {h.capacity})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="small text-muted">No halls added</div>
                    )}
                  </div>

                  <div className="col-md-4 border-end">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0 text-dark">Subjects</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-cta rounded-pill px-3 text-white"
                        onClick={() => addSubject(cIdx)}
                      >
                        <FaPlus className="me-1" /> Add
                      </button>
                    </div>

                    <div className="pe-3">
                      {cls.subjects?.map((sub, sIdx) => (
                        <div key={sIdx} className="mb-2">
                          <div className="input-group input-group-sm shadow-sm rounded border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted px-2">
                              <small className="fw-bold">{sIdx + 1}</small>
                            </span>

                            <input
                              type="text"
                              placeholder="Enter Subject Name"
                              className="form-control border-0 shadow-none ps-2"
                              style={{ fontSize: "14px", height: "38px" }}
                              value={sub.subjectName}
                              onChange={(e) => {
                                const d = [...classesData];
                                d[cIdx].subjects[sIdx].subjectName =
                                  e.target.value;
                                setClassesData(d);
                              }}
                              required
                            />

                            <button
                              type="button"
                              className="btn btn-white border-0 text-danger px-3"
                              title="Remove Subject"
                              onClick={() => {
                                const d = [...classesData];
                                d[cIdx].subjects.splice(sIdx, 1);
                                setClassesData(d);
                              }}
                              style={{ fontSize: "1.2rem", lineHeight: "1" }}
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 ms-md-2">
                      <h6 className="fw-bold mb-0 text-dark">Batches</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-info text-white rounded-pill px-3"
                        onClick={() => {
                          const d = [...classesData];
                          if (!d[cIdx].batches) d[cIdx].batches = [];
                          d[cIdx].batches.push({ batchName: "", labId: null });
                          setClassesData(d);
                        }}
                      >
                        <FaPlus className="me-1" /> Add
                      </button>
                    </div>

                    <div className="pe-3">
                      {cls.batches?.map((btch, bIdx) => (
                        <div
                          key={bIdx}
                          className="mb-2"
                          style={{ borderStyle: "dashed !important" }}
                        >
                          <div className="input-group input-group-sm shadow-sm rounded border overflow-hidden">
                            <span className="input-group-text bg-light border-0 text-muted px-2">
                              <small
                                className="text-info fw-bold me-1"
                                style={{ fontSize: "10px" }}
                              >
                                Batch {bIdx + 1}
                              </small>
                            </span>

                            <input
                              type="text"
                              placeholder="A1"
                              className="form-control border-0 shadow-none ps-2"
                              style={{
                                width: "45px",
                                outline: "none",
                                boxShadow: "none",
                                fontSize: "13px",
                              }}
                              value={btch.batchName}
                              onChange={(e) => {
                                const d = [...classesData];
                                d[cIdx].batches[bIdx].batchName =
                                  e.target.value;
                                setClassesData(d);
                              }}
                            />



                            <button
                              type="button"
                              className="btn btn-white border-0 text-danger px-3"
                              style={{ fontSize: "18px", lineHeight: "1" }}
                              onClick={() => {
                                const d = [...classesData];
                                d[cIdx].batches.splice(bIdx, 1);
                                setClassesData(d);
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!cls.batches || cls.batches.length === 0) && (
                        <span className="badge bg-light text-muted fw-normal border italic">
                          No batches added
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <hr />
            <div className="section-card p-3 mb-4">
              <div className="row g-2 mb-3">
                <div className="col-md-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-bold">Add Teachers :</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-cta px-3 rounded-pill text-white"
                      onClick={() =>
                        setTeachers([
                          ...teachers,
                          {
                            _id: makeObjectId(),
                            teacherName: "",
                            shortName: "",
                            locationLabId: null,
                          },
                        ])
                      }
                    >
                      <FaPlus className="me-1" /> Add Teacher
                    </button>
                  </div>

                  <div className="row g-2">
                    {teachers.map((t, tIdx) => (
                      <div key={tIdx} className="col-md-4">
                        <div className="card-compact input-group input-group-sm border rounded shadow-sm bg-white p-2">
                          <div className="d-flex flex-column w-100">
                            <input
                              type="text"
                              placeholder="Full Name (e.g. Dr. Patil)"
                              className="form-control form-control-sm border-0 mb-1 fw-bold"
                              value={t.teacherName}
                              onChange={(e) => {
                                const newTeachers = [...teachers];
                                newTeachers[tIdx].teacherName = e.target.value;
                                setTeachers(newTeachers);
                              }}
                              required
                            />
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="text"
                                placeholder="Short Name (e.g. SNP)"
                                className="form-control form-control-sm border-0 text-muted"
                                style={{ fontSize: "0.75rem", width: 140 }}
                                value={t.shortName}
                                onChange={(e) => {
                                  const newTeachers = [...teachers];
                                  newTeachers[tIdx].shortName =
                                    e.target.value.toUpperCase();
                                  setTeachers(newTeachers);
                                }}
                              />
                              {/* Teacher location / cabin: map to a lab id (optional) */}
                              <select
                                className="form-select form-select-sm"
                                style={{ width: 180 }}
                                value={t.locationLabId || ""}
                                onChange={(e) => {
                                  const newTeachers = [...teachers];
                                  newTeachers[tIdx].locationLabId =
                                    e.target.value || null;
                                  setTeachers(newTeachers);
                                }}
                              >
                                <option value="">-- Cabin (Lab) --</option>
                                {labs.map((l) => (
                                  <option key={l._id} value={l._id}>
                                    {l.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm text-danger ms-2"
                              onClick={() => {
                                const newTeachers = [...teachers];
                                newTeachers.splice(tIdx, 1);
                                setTeachers(newTeachers);
                              }}
                              title="Remove Teacher"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr />
            {/* Timing & Slots section */}
            <div className="section-card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-bold">Timing & Slots</label>
                <button
                  type="button"
                  className="btn btn-sm btn-cta px-3 rounded-pill text-white"
                  onClick={() =>
                    setTimeSlots([
                      ...timeSlots,
                      { from: "", to: "", type: "LEC" },
                    ])
                  }
                >
                  <FaPlus className="me-1" /> Add Slot
                </button>
              </div>

              <div className="row g-2">
                {timeSlots.map((slot, i) => (
                  <div key={i} className="col-md-6 mb-2">
                    <div className="input-group input-group-sm">
                      <input
                        className="form-control form-control-sm"
                        placeholder="From (HH:MM)"
                        value={slot.from}
                        onChange={(e) => {
                          const s = [...timeSlots];
                          s[i].from = e.target.value;
                          setTimeSlots(s);
                        }}
                      />
                      <input
                        className="form-control form-control-sm"
                        placeholder="To (HH:MM)"
                        value={slot.to}
                        onChange={(e) => {
                          const s = [...timeSlots];
                          s[i].to = e.target.value;
                          setTimeSlots(s);
                        }}
                      />
                      <select
                        className="form-select form-select-sm"
                        value={slot.type || "LEC"}
                        onChange={(e) => {
                          const s = [...timeSlots];
                          s[i].type = e.target.value;
                          setTimeSlots(s);
                        }}
                      >
                        <option value="LEC">LEC</option>
                        <option value="PRAC">PRAC</option>
                        <option value="RECESS">RECESS</option>
                        <option value="LUNCH">LUNCH</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          setTimeSlots(timeSlots.filter((_, j) => j !== i))
                        }
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Labs management: allow adding named labs (helpful when a subject requires a specific lab) */}
            <div className="section-card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-bold">Labs / Rooms</label>
                <button
                  type="button"
                  className="btn btn-sm btn-cta px-3 rounded-pill text-white"
                  onClick={() =>
                    setLabs([
                      ...labs,
                      { _id: makeObjectId(), name: "Lab-", capacity: 30 },
                    ])
                  }
                >
                  <FaPlus className="me-1" /> Add Lab
                </button>
              </div>
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    // mark all classes with semester VII or VIII as saturdayProject
                    const d = [...classesData];
                    for (let i = 0; i < d.length; i++) {
                      if (d[i].semester === "VII" || d[i].semester === "VIII")
                        d[i].saturdayProject = true;
                    }
                    setClassesData(d);
                  }}
                >
                  Mark Sem VII & VIII as Saturday Project
                </button>
              </div>
              <div className="row g-2">
                {labs.map((l, li) => (
                  <div key={li} className="col-md-4 mb-2">
                    <div className="input-group input-group-sm">
                      <input
                        className="form-control form-control-sm"
                        value={l.name}
                        onChange={(e) => {
                          const a = [...labs];
                          a[li].name = e.target.value;
                          setLabs(a);
                        }}
                      />
                      <input
                        className="form-control form-control-sm"
                        type="number"
                        value={l.capacity}
                        onChange={(e) => {
                          const a = [...labs];
                          a[li].capacity = Number(e.target.value || 0);
                          setLabs(a);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setLabs(labs.filter((_, j) => j !== li))}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <hr />
              <div className="small text-muted">
                Lecture halls are managed in the <strong>Lecture Halls</strong>{" "}
                tab above.
              </div>
            </div>
            {classesData.map((cls, cIdx) => (
              <div key={cIdx} className="section-card p-4 mb-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="fw-bold">Class: {cls.className}</label>
                    <input
                      className="form-control"
                      value={cls.className}
                      onChange={(e) => {
                        const d = [...classesData];
                        d[cIdx].className = e.target.value;
                        setClassesData(d);
                      }}
                    />
                    <div className="form-check form-check-inline mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`satProj-${cIdx}`}
                        checked={cls.saturdayProject || false}
                        onChange={(e) => {
                          const d = [...classesData];
                          d[cIdx].saturdayProject = e.target.checked;
                          setClassesData(d);
                        }}
                      />
                      <label
                        className="form-check-label small text-muted"
                        htmlFor={`satProj-${cIdx}`}
                      >
                        Saturday Project (keep Saturday empty)
                      </label>
                    </div>
                  </div>
                </div>

                <h6 className="mt-3 fw-bold">Subjects for {cls.className}</h6>
                {cls.subjects?.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    className="row g-2 mb-3 bg-white p-3 rounded shadow-sm align-items-start border mx-0"
                  >
                    <div className="col-md-3">
                      <input
                        type="text"
                        placeholder="Subject"
                        className="form-control form-control-sm fw-bold"
                        value={sub.subjectName}
                        onChange={(e) => {
                          const d = [...classesData];
                          d[cIdx].subjects[sIdx].subjectName = e.target.value;
                          setClassesData(d);
                        }}
                        required
                      />
                    </div>

                    {/* Practical details row */}
                    <div className="col-12 mt-2">
                      <div className="row g-2 align-items-center">
                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            P
                          </label>
                          <input
                            type="number"
                            placeholder="P"
                            className="form-control form-control-sm"
                            value={sub.practicalsPerWeek}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[sIdx].practicalsPerWeek = Number(
                                e.target.value,
                              );
                              setClassesData(d);
                            }}
                          />
                        </div>

                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            Prac Teacher
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={sub.assignedTeachers?.practicalTeacher || ""}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[
                                sIdx
                              ].assignedTeachers.practicalTeacher =
                                e.target.value;
                              setClassesData(d);
                            }}
                          >
                            <option value="">-- select --</option>
                            {teachers.map((t, idx) => (
                              <option key={idx} value={t._id}>
                                {t.shortName || t.teacherName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Common Lab for all batches of this subject */}
                        <div className="col-md-12 mt-2">
                          <label className="small text-muted mb-1 d-block">
                            Lab / Room (Applies to all batches if not overridden)
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={sub.labRoom || ""}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[sIdx].labRoom = e.target.value;
                              setClassesData(d);
                            }}
                          >
                            <option value="">-- select lab --</option>
                            {labs.map((l, li) => (
                              <option key={li} value={l._id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-12 mt-2">
                           <div className="form-check form-check-inline">
                              <input 
                                 className="form-check-input"
                                 type="checkbox"
                                 checked={sub.sameBatchPractical || false}
                                 onChange={(e) => {
                                    const d = [...classesData];
                                    d[cIdx].subjects[sIdx].sameBatchPractical = e.target.checked;
                                    setClassesData(d);
                                 }}
                              />
                              <label className="form-check-label small text-muted">Same practical for all batches (single-slot for all)</label>
                           </div>
                        </div>
                      </div>

                      {cls.batches && cls.batches.length > 0 && !sub.sameBatchPractical && (
                        <div className="mt-2">
                          <div className="small text-muted mb-1">
                            Per-batch practical teachers
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {cls.batches.map((bt, bIdx) => {
                              const existing =
                                sub.practicalTeachers?.find(
                                  (p) => p.batchIndex === bIdx,
                                ) || {};
                              return (
                                  <div
                                    key={bIdx}
                                    className="input-group input-group-sm"
                                    style={{ width: 300 }}
                                  >
                                    <span className="input-group-text bg-light">
                                      {bt.batchName || `B${bIdx + 1}`}
                                    </span>
                                    <select
                                      className="form-select form-select-sm"
                                      value={existing.teacherId || ""}
                                      onChange={(e) => {
                                        const d = [...classesData];
                                        if (!d[cIdx].subjects[sIdx].practicalTeachers)
                                          d[cIdx].subjects[sIdx].practicalTeachers = [];
                                        const arr = d[cIdx].subjects[sIdx].practicalTeachers;
                                        const idx = arr.findIndex((p) => p.batchIndex === bIdx);
                                        const selectedTeacherId = e.target.value || null;
                                        if (idx === -1) {
                                          arr.push({ batchIndex: bIdx, teacherId: selectedTeacherId, labId: null });
                                        } else {
                                          arr[idx].teacherId = selectedTeacherId;
                                        }

                                        // If selected teacher has a cabin/location lab, auto-assign that lab to the batch
                                        if (selectedTeacherId) {
                                          const teacherObj = teachers.find((x) => x._id === selectedTeacherId);
                                          if (teacherObj && teacherObj.locationLabId) {
                                            const currentIdx = arr.findIndex((p) => p.batchIndex === bIdx);
                                            if (currentIdx !== -1) {
                                              arr[currentIdx].labId = teacherObj.locationLabId;
                                            }
                                          }
                                        }
                                        setClassesData(d);
                                      }}
                                    >
                                      <option value="">-- teacher --</option>
                                      {teachers.map((t, ti) => (
                                        <option key={ti} value={t._id}>
                                          {t.shortName || t.teacherName}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    {labs && labs.length > 0 && (
                                      <select
                                        className="form-select form-select-sm"
                                        value={existing.labId || ""}
                                        onChange={(e) => {
                                          const d = [...classesData];
                                          if (!d[cIdx].subjects[sIdx].practicalTeachers)
                                            d[cIdx].subjects[sIdx].practicalTeachers = [];
                                          const arr = d[cIdx].subjects[sIdx].practicalTeachers;
                                          const idx = arr.findIndex((p) => p.batchIndex === bIdx);
                                          if (idx === -1) {
                                            arr.push({ batchIndex: bIdx, teacherId: null, labId: e.target.value || null });
                                          } else {
                                            arr[idx].labId = e.target.value || null;
                                          }
                                          setClassesData(d);
                                        }}
                                      >
                                        <option value="">-- lab --</option>
                                        {labs.map((l) => (
                                          <option key={l._id} value={l._id}>
                                            {l.name}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {cls.batches && cls.batches.length > 0 && sub.tutorialsPerWeek > 0 && (
                        <div className="mt-2">
                           <div className="small text-muted mb-1">Per-batch tutorial teachers & labs</div>
                           <div className="d-flex flex-wrap gap-2">
                              {cls.batches.map((bt, bIdx) => {
                                 const existing = sub.tutorialTeachers?.find(p => p.batchIndex === bIdx) || {};
                                 return (
                                    <div key={bIdx} className="input-group input-group-sm" style={{width: 300}}>
                                       <span className="input-group-text bg-light">{bt.batchName || `B${bIdx+1}`}</span>
                                       <select 
                                          className="form-select form-select-sm"
                                          value={existing.teacherId || ""}
                                          onChange={(e) => {
                                             const d = [...classesData];
                                             if(!d[cIdx].subjects[sIdx].tutorialTeachers) d[cIdx].subjects[sIdx].tutorialTeachers = [];
                                             const arr = d[cIdx].subjects[sIdx].tutorialTeachers;
                                             const idx = arr.findIndex(p => p.batchIndex === bIdx);
                                             if(idx === -1) arr.push({batchIndex: bIdx, teacherId: e.target.value, labId: null});
                                             else arr[idx].teacherId = e.target.value;
                                             setClassesData(d);
                                          }}
                                       >
                                          <option value="">-- teacher --</option>
                                          {teachers.map((t, ti) => (
                                            <option key={ti} value={t._id}>
                                              {t.shortName || t.teacherName}
                                            </option>
                                          ))}
                                       </select>
                                       <select 
                                          className="form-select form-select-sm"
                                          value={existing.labId || ""}
                                          onChange={(e) => {
                                             const d = [...classesData];
                                             if(!d[cIdx].subjects[sIdx].tutorialTeachers) d[cIdx].subjects[sIdx].tutorialTeachers = [];
                                             const arr = d[cIdx].subjects[sIdx].tutorialTeachers;
                                             const idx = arr.findIndex(p => p.batchIndex === bIdx);
                                             if(idx === -1) arr.push({batchIndex: bIdx, teacherId: null, labId: e.target.value});
                                             else arr[idx].labId = e.target.value;
                                             setClassesData(d);
                                          }}
                                       >
                                          <option value="">-- lab --</option>
                                          {labs.map((l, li) => (
                                            <option key={li} value={l._id}>
                                              {l.name}
                                            </option>
                                          ))}
                                       </select>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Lecture schedule row */}
                    <div className="col-12 mt-3">
                      <div className="row g-2 align-items-center">
                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            L
                          </label>
                          <input
                            type="number"
                            placeholder="L"
                            className="form-control form-control-sm"
                            value={sub.lecturesPerWeek}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[sIdx].lecturesPerWeek = Number(
                                e.target.value,
                              );
                              setClassesData(d);
                            }}
                          />
                        </div>

                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            Lec Teacher
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={sub.assignedTeachers?.lectureTeacher || ""}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[
                                sIdx
                              ].assignedTeachers.lectureTeacher =
                                e.target.value;
                              setClassesData(d);
                            }}
                          >
                            <option value="">-- select --</option>
                            {teachers.map((t, idx) => (
                              <option key={idx} value={t._id}>
                                {t.shortName || t.teacherName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            T
                          </label>
                          <input
                            type="number"
                            placeholder="T"
                            className="form-control form-control-sm"
                            value={sub.tutorialsPerWeek}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[sIdx].tutorialsPerWeek = Number(
                                e.target.value,
                              );
                              setClassesData(d);
                            }}
                          />
                        </div>

                        <div className="col-auto">
                          <label className="small text-muted mb-1 d-block">
                            Tut Teacher
                          </label>
                          <select
                            className="form-select form-select-sm"
                            value={sub.assignedTeachers?.tutorialTeacher || ""}
                            onChange={(e) => {
                              const d = [...classesData];
                              d[cIdx].subjects[
                                sIdx
                              ].assignedTeachers.tutorialTeacher =
                                e.target.value;
                              setClassesData(d);
                            }}
                          >
                            <option value="">-- select --</option>
                            {teachers.map((t, idx) => (
                              <option key={idx} value={t._id}>
                                {t.shortName || t.teacherName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-sm text-danger ms-1"
                            onClick={() => removeSubject(cIdx, sIdx)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Compact teacher row showing current assignments */}
                    <div className="col-12 mt-3">
                      <div className="d-flex gap-2 align-items-center">
                        <div className="small text-muted">Assigned:</div>
                        <div className="badge bg-light text-dark">
                          Lec:{" "}
                          {teachers.find(
                            (t) =>
                              t._id === sub.assignedTeachers?.lectureTeacher,
                          )?.shortName || "-"}
                        </div>
                        <div className="badge bg-light text-dark">
                          Prac:{" "}
                          {teachers.find(
                            (t) =>
                              t._id === sub.assignedTeachers?.practicalTeacher,
                          )?.shortName || "-"}
                        </div>
                        <div className="badge bg-light text-dark">
                          Tut:{" "}
                          {teachers.find(
                            (t) =>
                              t._id === sub.assignedTeachers?.tutorialTeacher,
                          )?.shortName || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-cta mt-2 text-white"
                  onClick={() => addSubject(cIdx)}
                >
                  <FaPlus className="me-1" /> Add Subject
                </button>
              </div>
            ))}

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-success btn-lg px-5 btn-cta"
                disabled={saving}
              >
                {saving ? "Creating Project..." : "Create Academic Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProjectInfo;
