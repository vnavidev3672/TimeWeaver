import React, { useEffect, useState } from "react";
import config from "../../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../Component/Layout/Layout";
import { useAuth } from "../../context/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FaFilePdf, FaFileExcel, FaImage, FaEdit, FaArrowLeft, FaPrint, FaMagic, FaShare
} from "react-icons/fa";
import toast from "react-hot-toast";

const ViewProject = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/ut/view/${id}`);
      if (data.success) setProject(data.project);
    } catch (err) {
      console.error(err);
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleRegenerate = () => {
    setRefreshKey(Date.now());
    toast.success("Regenerate Time Table!");
  };

  const handlePrint = () => window.print();

  const downloadPDF = () => {
    const input = document.getElementById("bvcoe-timetable");
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, imgHeight);
      pdf.save(`${project.projectName}_Timetable.pdf`);
    });
  };

  const downloadExcel = () => {
    const table = document.getElementById("timetable-table");
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, `${project.projectName}_Timetable.xlsx`);
  };

  const downloadImage = () => {
    const element = document.getElementById("bvcoe-timetable");
    html2canvas(element, { scale: 3, useCORS: true, backgroundColor: "#ffffff" }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${project.projectName}_Timetable.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    });
  };

  const sharePDF = async () => {
    const input = document.getElementById("bvcoe-timetable");
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, imgHeight);
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `${project.projectName}_Timetable.pdf`, { type: "application/pdf" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `${project.projectName} Timetable`,
          text: "Check Time Table.",
        });
      } else {
        toast.error("Don not Support");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateTableRows = () => {
    if (!project) return [];
    const rows = [];
    const { examDates, timeSlots, classes } = project;

    let allSubjectsPool = [];
    classes.forEach(cls => {
      cls.subjects.forEach(subj => {
        allSubjectsPool.push({
          className: cls.className,
          subjectName: subj.subjectName
        });
      });
    });

    const shuffledPool = [...allSubjectsPool].sort(() => 0.5 - Math.random() + refreshKey);

    let scheduleMap = {};
    let poolIndex = 0;

    examDates.forEach((dateObj) => {
      timeSlots.forEach((slotObj) => {
        classes.forEach((cls) => {
          const subjectForThisClass = shuffledPool.find((item, idx) => {
            return item.className === cls.className && !item.assigned;
          });

          if (subjectForThisClass) {
            const key = `${dateObj.date}-${slotObj.from}-${cls.className}`;
            scheduleMap[key] = subjectForThisClass.subjectName;
            subjectForThisClass.assigned = true;
          }
        });
      });
    });

    examDates.forEach((examDate) => {
      let dailyExamsCount = 0;
      timeSlots.forEach(slot => {
        classes.forEach(cls => {
          if (scheduleMap[`${examDate.date}-${slot.from}-${cls.className}`]) dailyExamsCount++;
        });
      });

      let isFirstDateCell = true;

      timeSlots.forEach((slot) => {
        let examsInThisSlot = classes.filter(cls =>
          scheduleMap[`${examDate.date}-${slot.from}-${cls.className}`]
        ).length;

        let isFirstSlotCell = true;

        classes.forEach((cls) => {
          const subjectName = scheduleMap[`${examDate.date}-${slot.from}-${cls.className}`];

          if (subjectName) {
            rows.push(
              <tr key={`${examDate.date}-${slot.from}-${cls.className}-${refreshKey}`}>
                {isFirstDateCell && (
                  <td rowSpan={dailyExamsCount} className="align-middle fw-bold border-black bg-light border-3">
                    {new Date(examDate.date).toLocaleDateString('en-GB')} <br />
                    {examDate.day}
                  </td>
                )}
                {isFirstSlotCell && (
                  <td rowSpan={examsInThisSlot} className="align-middle border-black border-3 fw-bold">
                    {slot.from} - {slot.to}
                  </td>
                )}
                <td className="border-black border-3">{cls.className}</td>
                <td className="border-black ps-3 fw-bold small border-3 ">{subjectName}</td>
              </tr>
            );
            isFirstDateCell = false;
            isFirstSlotCell = false;
          }
        });
      });
    });

    return rows;
  };

  if (loading) return <Layout><div className="text-center mt-5">Loading...</div></Layout>;
  if (!project) return <Layout><div className="text-center mt-5">Project Not Found</div></Layout>;

  return (
    <Layout>
      <div className="container p-0 px-md-5">
        <div className="d-flex justify-content-between align-items-center  d-print-none">
          <div className="d-flex align-items-center gap-2 text-muted shadow-sm px-3 py-2 bg-white rounded-pill"
            style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <FaArrowLeft /> <span className="small fw-bold">Dashboard</span>
          </div>

          {auth?.user?.role === 1 && (
            <div className="d-flex gap-2">
              <button className="btn btn-info text-white fw-bold shadow-sm" onClick={handleRegenerate}>
                <FaMagic /> Shufflle
              </button>
              <button className="btn btn-warning fw-bold shadow-sm" onClick={() => navigate(`/project/unit-test/update/${id}`)}>
                <FaEdit /> Edit
              </button>
            </div>
          )}
        </div>

        <div className="d-print-none overflow-hidden">
          <div className="pt-2 bg-white d-flex justify-content-end">
            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-center justify-content-md-end">
 
              <button
                className="btn btn-dark btn-sm d-flex flex-column flex-md-column align-items-center small-btn"
                onClick={sharePDF}
              >
                <FaShare />
                <span className="small-text">Share</span>
              </button>
 
              <button
                className="btn btn-danger btn-sm d-flex flex-column flex-md-column align-items-center small-btn"
                onClick={downloadPDF}
              >
                <FaFilePdf />
                <span className="small-text">PDF</span>
              </button>
 
              <button
                className="btn btn-success btn-sm d-flex flex-column flex-md-column align-items-center small-btn"
                onClick={downloadExcel}
              >
                <FaFileExcel />
                <span className="small-text">Excel</span>
              </button>
 
              <button
                className="btn btn-primary btn-sm d-flex flex-column flex-md-column align-items-center small-btn"
                onClick={downloadImage}
              >
                <FaImage />
                <span className="small-text">Image</span>
              </button>

              <button
                className="btn btn-outline-dark btn-sm d-flex flex-column flex-md-column align-items-center small-btn"
                onClick={handlePrint}
              >
                <FaPrint />
                <span className="small-text text-dark">Print</span>
              </button>

            </div>
          </div>
        </div>

        <div className="bg-white py-4  mb-5 time-div-1" style={{ position: "relative", minHeight: "400px" }}>
          <div id="bvcoe-timetable" className="p-4 mx-auto time-div-2 border" style={{ maxWidth: "1050px", color: "black" }}>
            <div className="text-center mb-4">
              <img src="https://tse4.mm.bing.net/th/id/OIP.0VFIMCOrCqZVFEEPzXDtcgHaDh?pid=Api&P=0&h=180"
                alt="Logo" style={{ height: "70px" }} className="mb-2" crossOrigin="anonymous" />
              <h4 className="fw-bold mb-0">Bharati Vidyapeeth's College of Engineering, Kolhapur</h4>
              <p className="mb-0 fw-bold text-uppercase">Department of Computer Science and Engineering</p>

              <div className="d-flex justify-content-between mt-3 py-2 px-5 fw-bold small">
                <span>Academic Year : 2025-26</span>
                <span>{project.projectName} Time Table</span>
                <span>
                  Dates: {new Date(project.examDates[0].date).toLocaleDateString('en-GB')} To {new Date(project.examDates[project.examDates.length - 1].date).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            <div className="table-responsive px-5">
              <table id="timetable-table" className="table table-bordered border-dark border-3 text-center align-middle custom-table">
                <thead className="bg-light border-3">
                  <tr className="border-3">
                    <th className="border-3">Date</th>
                    <th className="border-3">Time</th>
                    <th className="border-3">Class</th>
                    <th className="border-3">Subject</th>
                  </tr>
                </thead>
                <tbody className="border-3">
                  {generateTableRows()}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-5 pt-4 px-5 fw-bold text-uppercase small">
              <div className="text-center"><div style={{ height: '40px' }}></div><p>Exam Coordinator</p></div>
              <div className="text-center"><div style={{ height: '40px' }}></div><p>H.O.D.</p></div>
              <div className="text-center"><div style={{ height: '40px' }}></div><p>Principal</p></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-table th, .custom-table td { 
          border: 2px solid black !important; 
          font-family: 'Times New Roman', serif;
        }
        .fw-bold { font-weight: 700 !important; }
        @media print {
          .d-print-none { display: none !important; }
          body { background: white !important; }
          .container { max-width: 100% !important; margin: 0 !important; }
          #bvcoe-timetable { padding: 0 !important; border: none !important; }
        }
      `}</style>
    </Layout>
  );
};

export default ViewProject;