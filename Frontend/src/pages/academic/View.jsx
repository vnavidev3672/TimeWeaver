import React, { useEffect, useState } from "react";
import {
  generateFinalSchedule as generateFromUtils,
  computeScore as computeScoreFromUtils,
} from "../../utils/scheduler";
import config from "../../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../Component/Layout/Layout";
import {
  FaArrowLeft,
  FaPrint,
  FaMagic,
  FaExclamationTriangle,
  FaFilePdf,
  FaFileExcel,
  FaImage,
  FaEdit,
  FaShare,
} from "react-icons/fa";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/auth";
import "../../Styles/View.css";

const ViewProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [shuffling, setShuffling] = useState(false);
  const [finalSchedules, setFinalSchedules] = useState([]);
  const [bestScore, setBestScore] = useState(null);
  const [bestBreakdown, setBestBreakdown] = useState(null);
  const [viewType, setViewType] = useState("master"); 
  const [auth] = useAuth();

  useEffect(() => {
    if (finalSchedules.length === 1) {
      setViewType("individual");
    } else {
      setViewType("master");
    }
  }, [finalSchedules]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const validTimeSlots = (project?.timeSlots || []).filter((s) => s.from && s.to);
  const customTimeSlots =
    validTimeSlots.length > 0
      ? validTimeSlots
      : [
          { from: "09:15", to: "10:15", type: "LEC" },
          { from: "10:15", to: "11:15", type: "LEC" },
          { from: "11:15", to: "11:30", type: "RECESS" },
          { from: "11:30", to: "12:30", type: "LEC" },
          { from: "12:30", to: "01:30", type: "LEC" },
          { from: "01:30", to: "02:15", type: "LUNCH" },
          { from: "02:15", to: "03:15", type: "LEC" },
          { from: "03:15", to: "04:15", type: "LEC" },
        ];
  const generateFinalSchedule = (proj) => generateFromUtils(proj);

  // Fetch project data from API when component mounts
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${config.API_BASE_URL}/ac/view/${id}`);
        if (data && data.success) {
          setProject(data.project);
        } else {
          toast.error("Project load failed!");
        }
      } catch (error) {
        console.error("Project load failed:", error);
        toast.error("Project load failed!");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  // Run multiple randomized attempts of generateFinalSchedule and pick the best
  const handleShuffle = async (iterations = 100) => {
    if (!project) {
      toast.error("No project loaded to shuffle");
      return;
    }
    setShuffling(true);
    try {
      let best = null;
      let bestScore = Infinity;
      let bestBreakdown = null;

      const computeScore = (candidate) => {
        // candidate: array of classStates with schedule and extraPending
        let unassigned = 0;
        const teacherSlotCounts = {}; // key: `${day}-${sIdx}-${teacherId}` -> count
        const labSlotCounts = {}; // key: `${day}-${sIdx}-${labId}` -> count
        const hallSlotCounts = {}; // key: `${day}-${sIdx}-${hallId}` -> count
        const teacherTotalSlots = {}; // teacherId -> total assigned slots

        candidate.forEach((cls) => {
          if (cls.extraPending) unassigned += cls.extraPending.length;
          const schedule = cls.schedule || {};
          days.forEach((day) => {
            const daySched = schedule[day] || [];
            daySched.forEach((cell, sIdx) => {
              if (!cell) return;
              if (cell.type === "P" && cell.isFirst) {
                // practical covers sIdx and sIdx+1
                (cell.batchAssignment || []).forEach((ba) => {
                  const t = ba.teacher;
                  const lab = ba.labId;
                  [sIdx, sIdx + 1].forEach((slotIdx) => {
                    if (!t) return;
                    const tk = `${day}-${slotIdx}-${t}`;
                    teacherSlotCounts[tk] = (teacherSlotCounts[tk] || 0) + 1;
                    teacherTotalSlots[t] = (teacherTotalSlots[t] || 0) + 1;
                    if (lab) {
                      const lk = `${day}-${slotIdx}-${lab}`;
                      labSlotCounts[lk] = (labSlotCounts[lk] || 0) + 1;
                    }
                  });
                });
              } else if (cell.type === "L" || cell.type === "T") {
                const t =
                  cell.subject?.assignedTeachers?.lectureTeacher ||
                  cell.subject?.assignedTeachers?.tutorialTeacher;
                if (t) {
                  const tk = `${day}-${sIdx}-${t}`;
                  teacherSlotCounts[tk] = (teacherSlotCounts[tk] || 0) + 1;
                  teacherTotalSlots[t] = (teacherTotalSlots[t] || 0) + 1;
                }
                // If it's a tutorial with a lab assigned, count lab usage
                if (cell.type === "T" && cell.labId) {
                  const lk = `${day}-${sIdx}-${cell.labId}`;
                  labSlotCounts[lk] = (labSlotCounts[lk] || 0) + 1;
                } else if (cls.lectureHallId) {
                  // lecture hall conflict: use class-level lectureHallId if present
                  const hk = `${day}-${sIdx}-${cls.lectureHallId}`;
                  hallSlotCounts[hk] = (hallSlotCounts[hk] || 0) + 1;
                }
              }
            });
          });
        });

        // Count conflicts: any slot count > 1 indicates a conflict
        let teacherConflicts = 0;
        Object.values(teacherSlotCounts).forEach((v) => {
          if (v > 1) teacherConflicts += v - 1;
        });

        let labConflicts = 0;
        Object.values(labSlotCounts).forEach((v) => {
          if (v > 1) labConflicts += v - 1;
        });

        let hallConflicts = 0;
        Object.values(hallSlotCounts).forEach((v) => {
          if (v > 1) hallConflicts += v - 1;
        });

        // teacher load variance (preference for balanced load)
        const loads = Object.values(teacherTotalSlots);
        let variance = 0;
        if (loads.length > 0) {
          const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
          variance =
            loads.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / loads.length;
        }

        // score weights (tunable)
        const score =
          unassigned * 100 +
          teacherConflicts * 20 +
          labConflicts * 15 +
          hallConflicts * 10 +
          Math.round(variance);

        return {
          score,
          breakdown: {
            unassigned,
            teacherConflicts,
            labConflicts,
            hallConflicts,
            variance,
          },
        };
      };

      for (let i = 0; i < iterations; i++) {
        // Each call uses internal randomness in generateFinalSchedule
        const candidate = generateFinalSchedule(project);
        const { score, breakdown } = computeScore(candidate);

        if (score < bestScore) {
          bestScore = score;
          best = candidate;
          bestBreakdown = breakdown;
          // stop early if perfect
          if (bestScore === 0) break;
        }
      }

      if (best) {
        setFinalSchedules(best);
        setBestScore(bestScore);
        setBestBreakdown(bestBreakdown);
      }

      if (bestScore === 0) {
        toast.success("Shuffle done — perfect assignment (no unassigned load)");
      } else if (bestBreakdown) {
        toast(
          `Shuffle complete — score ${bestScore}. Unassigned: ${bestBreakdown.unassigned}, TeacherConflicts: ${bestBreakdown.teacherConflicts}, LabConflicts: ${bestBreakdown.labConflicts}, HallConflicts: ${bestBreakdown.hallConflicts}`,
        );
      } else {
        toast("Shuffle complete — no improvement found");
      }
    } catch (error) {
      console.error("Shuffle error:", error);
      toast.error("Shuffle failed");
    } finally {
      setShuffling(false);
    }
  };

  useEffect(() => {
    if (project) handleShuffle(60);
    else console.warn("ViewProject: no project received from API");
  }, [project, shuffleTrigger]);

  useEffect(() => {
    console.log("finalSchedules updated", { finalSchedules });
  }, [finalSchedules]);

  const getTeacherShortName = (id) => {
    const t = project?.teachers.find((t) => String(t._id) === String(id));
    return t ? t.shortName : "TBA";
  };

  const getLabName = (id) => {
    if (!id) return "";
    const l = project?.labs?.find((x) => String(x._id) === String(id));
    return l ? l.name : "";
  };

  const getLectureHallName = (id) => {
    if (!id) return "";
    const hall = project?.lectureHalls?.find(
      (h) => String(h._id) === String(id) || String(h.id) === String(id)
    );
    return hall ? hall.name : "";
  };

  if (loading)
    return (
      <Layout>
        <div className="p-5 text-center">Loading Data...</div>
      </Layout>
    );

  const downloadPDF = async (id, name) => {
    const input = document.getElementById(id);
    
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgProps = { width: canvas.width, height: canvas.height };
      
      // Convert pixels to mm (1px = 0.264583mm)
      // We use a scale factor to make it fit nicely
      const pdfWidth = 210; // Standard A4 width
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${name}_timetable.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const downloadImage = async (id, name) => {
    const input = document.getElementById(id);
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: input.scrollWidth,
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${name}_timetable.png`;
    link.click();
  };

  const downloadExcel = (idx, name) => {
    // Basic Excel export implementation
    let tableId = idx === "master" ? "master-table-id" : `table-${idx}`;
    const table = document.getElementById(tableId);
    if (!table) {
      toast.error("Table not found for Excel export");
      return;
    }
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");
    XLSX.writeFile(wb, `${name}_timetable.xlsx`);
  };

  const sharePDF = async (id, name) => {
    const input = document.getElementById(id);
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: input.scrollWidth,
    });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfWidth = 210;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], `${name}_timetable.pdf`, {
      type: "application/pdf",
    });

    if (navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: "Timetable",
          text: `Check out the timetable for ${name}`,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  const renderCellContent = (clsSch, day, sIdx) => {
    const cell = clsSch.schedule[day]?.[sIdx];

    if (cell?.type === "P" && !cell.isFirst) return null;
    if (cell?.type === "P" && cell.isFirst) {
      const maxDur = Math.max(...cell.batchAssignment.map((x) => x.duration || 2));
      return {
        colSpan: maxDur,
        content: (
          <div className="d-flex flex-column text-center h-100" style={{ fontSize: "10px" }}>
            {cell.batchAssignment.map((ba, bi) => (
              <div
                key={bi}
                className="fw-bold d-flex align-items-center justify-content-center flex-wrap"
                style={{
                  borderBottom: bi < cell.batchAssignment.length - 1 ? "1px solid black" : "none",
                  minHeight: "22px",
                  padding: "1px 0",
                }}
              >
                {ba.subjectName}({ba.type || "P"}) {getTeacherShortName(ba.teacher)} {ba.batchName}{" "}
                <span className="text-primary ms-1">{ba.labId ? getLabName(ba.labId) : ""}</span>
              </div>
            ))}
          </div>
        ),
      };
    }

    if (cell?.type === "L" || cell?.type === "T") {
      const tName =
        cell.type === "L"
          ? getTeacherShortName(cell.subject?.assignedTeachers?.lectureTeacher)
          : getTeacherShortName(cell.subject?.assignedTeachers?.tutorialTeacher);

      return {
        colSpan: 1,
        content: (
          <div style={{ fontSize: "10.5px" }} className="fw-bold">
            {cell.subject.subjectName}
            {cell.type === "T" ? "(T)" : ""} {tName} <br />
            {cell.type === "T" && cell.labId ? (
              <span className="text-primary d-block mt-1" style={{ fontSize: '9px', fontWeight: '800' }}>
                {getLabName(cell.labId)}
              </span>
            ) : (
              clsSch.lectureHallId && (
                <span className="text-primary d-block mt-1" style={{ fontSize: '9px', fontWeight: '800' }}>
                  {getLectureHallName(clsSch.lectureHallId) || "LH Assigned"}
                </span>
              )
            )}
          </div>
        ),
      };
    }

    return { colSpan: 1, content: <span className="text-muted small"></span> };
  };

  return (
    <Layout>
      <div className="container-fluid p-0 px-md-4">
        <div className="d-flex justify-content-between align-items-center mb-2 d-print-none mt-0">
          <div
            className="d-flex align-items-center gap-2 text-muted shadow-sm px-3 py-2 bg-white rounded-pill"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> <span className="small fw-bold">Dashboard</span>
          </div>

          <div className="btn-group shadow-sm">
            <button
              className={`btn btn-sm ${viewType === "individual" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewType("individual")}
            >
              Individual
            </button>
            <button
              className={`btn btn-sm ${viewType === "master" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewType("master")}
            >
              Master
            </button>
          </div>

          {auth.user.role === 1 && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-info text-white fw-bold shadow-sm"
                onClick={() => handleShuffle(100)}
                disabled={shuffling}
              >
                <FaMagic /> {shuffling ? "Shuffling..." : "Shuffle"}
              </button>
              <button
                className="btn btn-warning fw-bold shadow-sm"
                onClick={() => navigate(`/project/academic/update/${id}`)}
              >
                <FaEdit /> Edit
              </button>
            </div>
          )}
        </div>

        {bestScore !== null && bestBreakdown && (
          <div className="d-flex justify-content-center mb-4 d-print-none">
            <div
              className="bg-white border rounded-3 p-3 shadow-sm text-center"
              style={{ minWidth: "300px" }}
            >
              <div className="fw-bold text-dark mb-1">Shuffle complete — score {bestScore}.</div>
              <div className="small text-muted">
                Unassigned: {bestBreakdown.unassigned}, TeacherConflicts:{" "}
                {bestBreakdown.teacherConflicts},
              </div>
              <div className="small text-muted">
                LabConflicts: {bestBreakdown.labConflicts}, HallConflicts:{" "}
                {bestBreakdown.hallConflicts}
              </div>
            </div>
          </div>
        )}

        {viewType === "master" ? (
          <div className="mb-5 p-4 class-page-container  ">
            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-center justify-content-md-end mb-2">
              {[
                {
                  icon: <FaShare />,
                  label: "Share",
                  onClick: () => sharePDF("master-content", "Master"),
                  type: "dark",
                },
                {
                  icon: <FaFilePdf />,
                  label: "PDF",
                  onClick: () => downloadPDF("master-content", "Master"),
                  type: "danger",
                },
                {
                  icon: <FaFileExcel />,
                  label: "Excel",
                  onClick: () => downloadExcel("master", "Master"),
                  type: "success",
                },
                {
                  icon: <FaImage />,
                  label: "Image",
                  onClick: () => downloadImage("master-content", "Master"),
                  type: "primary",
                },
                {
                  icon: <FaPrint />,
                  label: "Print",
                  onClick: () => window.print(),
                  type: "outline-dark",
                },
              ].map((btn, i) => (
                <button
                  key={i}
                  className={`btn btn-sm btn-${btn.type} d-flex flex-column flex-md-column align-items-center small-btn`}
                  onClick={btn.onClick}
                >
                  {btn.icon}
                  <span className="small-text">{btn.label}</span>
                </button>
              ))}
            </div>

            <div
              id="master-content"
              className="p-4 border mx-auto time-div-2 bg-white shadow rounded"
              style={{ maxWidth: "1150px", color: "black" }}
            >
              <div className="text-center mb-4">
              <img
                src="https://tse4.mm.bing.net/th/id/OIP.0VFIMCOrCqZVFEEPzXDtcgHaDh?pid=Api&P=0&h=180"
                alt="Logo"
                style={{ height: "70px" }}
                className="mb-2"
              />
              <h4 className="fw-bold mb-0 text-dark">
                BHARATI VIDYAPEETH'S COLLEGE OF ENGINEERING, KOLHAPUR
              </h4>
              <p className="mb-0 fw-bold text-uppercase">
                Master Timetable - {project.deparmentName}
              </p>
              <div className="fw-bold small mt-1">
                Academic Year {project.academicYear} | W.E.F - 01/01/2026
              </div>
            </div>

            <div className="table-responsive">
              <table
                className="text-center align-middle master-table"
                id="master-table-id"
              >
                <thead>
                  <tr className="bg-light">
                    <th>Day</th>
                    <th>Class</th>
                    {customTimeSlots.map((slot, i) => (
                      <th key={i} className="small">
                        {slot.from} - {slot.to}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dIdx) => (
                    <React.Fragment key={day}>
                      {finalSchedules.map((clsSch, cIdx) => (
                        <tr
                          key={`${day}-${cIdx}`}
                          style={{
                            borderBottom:
                              cIdx === finalSchedules.length - 1
                                ? "2.5px solid black"
                                : "1px solid #dee2e6",
                          }}
                        >
                          {cIdx === 0 && (
                            <td
                              rowSpan={finalSchedules.length}
                              className="fw-bold bg-light"
                              style={{ verticalAlign: "middle", width: "60px" }}
                            >
                              {day.substring(0, 3)}
                            </td>
                          )}
                          <td className="fw-bold small bg-light" style={{ width: "80px", lineHeight: '1.2' }}>
                            <div>{clsSch.className}</div>
                            {clsSch.lectureHallId && (
                              <div className="text-primary x-small mt-1" style={{ fontSize: '8px' }}>
                                ({getLectureHallName(clsSch.lectureHallId)})
                              </div>
                            )}
                          </td>
                          {customTimeSlots.map((slot, sIdx) => {
                            if (slot.type === "RECESS" || slot.type === "LUNCH") {
                              if (cIdx === 0 && dIdx === 0) {
                                return (
                                  <td
                                    key={sIdx}
                                    rowSpan={days.length * finalSchedules.length}
                                    className="fw-bold bg-white vertical-text"
                                    style={{
                                      letterSpacing: "15px",
                                      fontSize: "12px",
                                      verticalAlign: "middle",
                                      width: "35px",
                                    }}
                                  >
                                    {slot.type}
                                  </td>
                                );
                              }
                              return null;
                            }

                            const result = renderCellContent(clsSch, day, sIdx);
                            if (!result) return null;
                            return (
                              <td
                                key={sIdx}
                                colSpan={result.colSpan}
                                className={`p-1 align-middle ${
                                  result.colSpan > 1 ? "bg-light-yellow" : ""
                                }`}
                                style={{ minWidth: "100px", height: "80px" }}
                              >
                                {result.content}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {/* Saturday Timing Row at the bottom */}
                  <tr className="bg-light fw-bold">
                    <td colSpan={2} className="small">Time for SAT</td>
                    {customTimeSlots.map((slot, i) => (
                      <td key={i} className="small px-1" style={{ fontSize: '9px' }}>
                        {slot.from} - {slot.to}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-5 pt-4 px-5 fw-bold text-uppercase small">
              <div className="text-center">
                <div style={{ height: "40px" }}></div>
                <p>Exam Coordinator</p>
              </div>
              <div className="text-center">
                <div style={{ height: "40px" }}></div>
                <p>H.O.D.</p>
              </div>
              <div className="text-center">
                <div style={{ height: "40px" }}></div>
                <p>Principal</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
          finalSchedules.map((clsSch, idx) => (
            <div key={idx} className="mb-5 p-4 class-page-container  ">
              <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-center justify-content-md-end mb-2">
                {[
                  {
                    icon: <FaFilePdf />,
                    label: "PDF",
                    onClick: () => downloadPDF(`content-${idx}`, clsSch.className),
                    type: "danger",
                  },
                  {
                    icon: <FaFileExcel />,
                    label: "Excel",
                    onClick: () => downloadExcel(idx, clsSch.className),
                    type: "success",
                  },
                  {
                    icon: <FaImage />,
                    label: "Image",
                    onClick: () => downloadImage(`content-${idx}`, clsSch.className),
                    type: "primary",
                  },
                  {
                    icon: <FaPrint />,
                    label: "Print",
                    onClick: () => window.print(),
                    type: "outline-dark",
                  },
                ].map((btn, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm btn-${btn.type} d-flex flex-column flex-md-column align-items-center small-btn`}
                    onClick={btn.onClick}
                  >
                    {btn.icon}
                    <span className="small-text">{btn.label}</span>
                  </button>
                ))}
              </div>

              <div
                className="bg-white mb-1 time-div-1 "
                style={{ position: "relative", minHeight: "500px" }}
              >
                <div
                  id={`content-${idx}`}
                  className="p-4 border mx-auto time-div-2"
                  style={{ maxWidth: "1050px", color: "black" }}
                >
                  <div className="text-center mb-4">
                    <img
                      src="https://tse4.mm.bing.net/th/id/OIP.0VFIMCOrCqZVFEEPzXDtcgHaDh?pid=Api&P=0&h=180"
                      alt="Logo"
                      style={{ height: "70px" }}
                      className="mb-2"
                    />

                    <h4 className="fw-bold mb-0 text-dark">
                      BHARATI VIDYAPEETH'S COLLEGE OF ENGINEERING, KOLHAPUR
                    </h4>
                    <p className="mb-0 fw-bold text-uppercase">
                      Department of{" "}
                      {project.deparmentName || "Computer Science and Engineering"}
                    </p>

                    <div className="d-flex justify-content-center gap-4 align-items-center mt-2  fw-bold small">
                      <span>TIME TABLE </span>
                      <span>
                        {" "}
                        CLASS - {clsSch.className} ({project.deparmentName})
                      </span>
                      <span>W.E.F - 01/01/2026</span>
                      <span>
                        Academic Year {project.academicYear} (SEM {clsSch.semester})
                      </span>
                    </div>
                  </div>

                  <div
                    className="table-responsive"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <table
                      className="text-center align-middle custom-table"
                      id={`table-${idx}`}
                    >
                      <thead>
                        <tr className="bg-light">
                          <th style={{ width: "80px" }}>Day \ Time</th>
                          {customTimeSlots.map((slot, i) => (
                            <th key={i} className="small">
                              {slot.from} - {slot.to}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {days.map((day, dIdx) => (
                          <tr key={day} style={{ height: "100px" }}>
                            <td className="fw-bold bg-light" style={{ width: "60px" }}>
                              {day.substring(0, 3)}
                            </td>
                            {customTimeSlots.map((slot, sIdx) => {
                              if (slot.type === "RECESS" || slot.type === "LUNCH") {
                                if (dIdx === 0) {
                                  return (
                                    <td
                                      key={sIdx}
                                      rowSpan={6}
                                      className="fw-bold bg-white vertical-text"
                                      style={{
                                        letterSpacing: "70px",
                                        fontSize: "18px",
                                        verticalAlign: "middle",
                                        width: "60px",
                                      }}
                                    >
                                      {slot.type}
                                    </td>
                                  );
                                }
                                return null;
                              }

                              const result = renderCellContent(clsSch, day, sIdx);
                              if (!result) return null;
                              return (
                                <td
                                  key={sIdx}
                                  colSpan={result.colSpan}
                                  className="p-1 align-middle text-center"
                                >
                                  {result.content}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between mt-5 pt-4 px-5 fw-bold text-uppercase small">
                    <div className="text-center">
                      <div style={{ height: "40px" }}></div>
                      <p>Exam Coordinator</p>
                    </div>
                    <div className="text-center">
                      <div style={{ height: "40px" }}></div>
                      <p>H.O.D.</p>
                    </div>
                    <div className="text-center">
                      <div style={{ height: "40px" }}></div>
                      <p>Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {clsSch.extraPending.length > 0 && (
                <div className="mt-0 p-2 bg-light border-start border-danger border-4 d-print-none">
                  <span className="text-danger fw-bold small">
                    <FaExclamationTriangle /> Unassigned Load:
                  </span>
                  <p className="mb-0 small text-muted">{clsSch.extraPending.join(", ")}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <style>{`
        .master-table, .custom-table, .table-bordered {
          border-collapse: collapse !important;
          width: 100% !important;
          background-color: white !important;
          border: 1px solid #000 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .master-table th, .master-table td, .custom-table th, .custom-table td, .table-bordered th, .table-bordered td {
          border: 1px solid #000 !important;
          vertical-align: middle !important;
          padding: 8px !important;
          background-clip: padding-box;
        }
        .master-table thead th, .custom-table thead th, .table-bordered thead th {
          background-color: #f8f9fa !important;
          color: #000 !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          font-size: 12px !important;
        }
        .bg-light { background-color: #f8f9fa !important; }
        .time-div-2 {
          box-shadow: none !important;
          border: none !important;
        }
        @media print {
          .d-print-none { display: none !important; }
        }
      `}</style>
    </Layout>
  );
};

export default ViewProject;
