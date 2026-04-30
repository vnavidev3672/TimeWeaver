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
      const { data } = await axios.get(`${config.API_BASE_URL}/ie/view/${id}`);
      if (data.success) setProject(data.project);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleRegenerate = () => {
    setRefreshKey(Date.now());
  };

  const handlePrint = () => window.print();

  const downloadPDF = () => {
    const input = document.getElementById("bvcoe-timetable");

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: input.scrollWidth,
    }).then((canvas) => {
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

    html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: element.scrollWidth,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${project.projectName}_Timetable.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    });
  };

  const sharePDF = async () => {
    const input = document.getElementById("bvcoe-timetable");

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
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
      const file = new File([pdfBlob], `${project.projectName}_Timetable.pdf`, {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `${project.projectName} Timetable`,
          text: "Check out the exam timetable.",
        });
      } else {
        toast.success("Dont Support");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
    }
  };

  const generateTableRows = () => {
    if (!project) return [];
    const rows = [];
    const { examDates, timeSlots, classes } = project;

    const classSchedules = classes.map((cls) => {
      const allPairs = [];
      let pairIndex = 0;
      cls.subjects.forEach((subj) => {
        cls.batches.forEach((batch) => {
          allPairs.push({
            className: cls.className,
            batchName: batch.batchName,
            subjectName: subj.subjectName,
            faculty: cls.teachers && cls.teachers.length > 0 ? cls.teachers[pairIndex % cls.teachers.length].name : "",
            location: cls.locations && cls.locations.length > 0 ? cls.locations[pairIndex % cls.locations.length].name : "",
          });
          pairIndex++;
        });
      });

      const totalSlots = examDates.length * timeSlots.length;
      const distributed = Array.from({ length: totalSlots }, () => []);

      const shuffled = [...allPairs].sort(() => (0.5 - Math.random() + refreshKey));

      shuffled.forEach((pair) => {
        let placed = false;
        for (let i = 0; i < totalSlots; i++) {
          const slotExams = distributed[i];
          if (!slotExams.some(e => e.batchName === pair.batchName) && 
              !slotExams.some(e => e.subjectName === pair.subjectName)) {
            distributed[i].push(pair);
            placed = true;
            break;
          }
        }
        if (!placed) {
          for (let i = 0; i < totalSlots; i++) {
            const slotExams = distributed[i];
            if (!slotExams.some(e => e.batchName === pair.batchName)) {
              distributed[i].push(pair);
              placed = true;
              break;
            }
          }
        }
        if (!placed) {
           let minSlot = 0;
           for(let i = 1; i < totalSlots; i++){
              if (distributed[i].length < distributed[minSlot].length) minSlot = i;
           }
           distributed[minSlot].push(pair);
        }
      });

      return distributed;
    });

    let globalSlotIndex = 0;
    examDates.forEach((examDate, dayIndex) => {
      let dailyData = [];
      let totalRowsForThisDate = 0;

      timeSlots.forEach((slot) => {
        let examsInSlot = [];
        classSchedules.forEach((schedule) => {
          if (schedule[globalSlotIndex] && schedule[globalSlotIndex].length > 0) {
            examsInSlot.push(...schedule[globalSlotIndex]);
          }
        });
        
        examsInSlot.sort((a, b) => {
           if(a.className !== b.className) return a.className.localeCompare(b.className);
           return a.batchName.localeCompare(b.batchName);
        });
        
        dailyData.push({ slot, examsInSlot });
        totalRowsForThisDate += examsInSlot.length;
        globalSlotIndex++;
      });

      let isFirstSlotOfDate = true;
      dailyData.forEach((slotGroup) => {
        const { slot, examsInSlot } = slotGroup;
        let isFirstRowOfSlot = true;
        
        let classRowSpans = {};
        examsInSlot.forEach(exam => {
           classRowSpans[exam.className] = (classRowSpans[exam.className] || 0) + 1;
        });
        let renderedClasses = new Set();

        examsInSlot.forEach((exam, index) => {
          let isFirstRowOfClass = !renderedClasses.has(exam.className);
          if (isFirstRowOfClass) renderedClasses.add(exam.className);

          rows.push(
            <tr key={`${dayIndex}-${slot.from}-${exam.className}-${exam.batchName}-${index}`}>
              {isFirstSlotOfDate && isFirstRowOfSlot && (
                <td rowSpan={totalRowsForThisDate} className="align-middle fw-bold bg-light">
                  {new Date(examDate.date).toLocaleDateString('en-GB')} <br />
                  {examDate.day}
                </td>
              )}
              {isFirstRowOfSlot && (
                <td rowSpan={examsInSlot.length} className="align-middle fw-bold">
                  {slot.from} - {slot.to}
                </td>
              )}
              {isFirstRowOfClass && (
                <td rowSpan={classRowSpans[exam.className]} className="align-middle fw-bold" style={{backgroundColor: Array.from(renderedClasses).indexOf(exam.className) % 2 === 0 ? '#fce4d6' : 'white'}}>
                  {exam.className}
                </td>
              )}
              <td className="fw-bold">{exam.batchName}</td>
              <td className="ps-3 fw-bold small">{exam.subjectName}</td>
              <td className="text-muted small">{exam.faculty}</td>
              <td className="text-muted small">{exam.location}</td>
            </tr>
          );
          isFirstRowOfSlot = false;
          isFirstSlotOfDate = false;
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

        <div className="d-flex mt-0 justify-content-between align-items-center mb-2 d-print-none">
          <div className="d-flex align-items-center gap-2 text-muted shadow-sm px-3 py-2 bg-white rounded-pill"
            style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <FaArrowLeft /> <span className="small fw-bold">Dashboard</span>
          </div>

          {auth.user.role === 1 &&
            <div className="d-flex gap-2">
              <button className="btn btn-info text-white fw-bold shadow-sm" onClick={handleRegenerate}>
                <FaMagic /> Shufflle
              </button>
              <button className="btn btn-warning fw-bold shadow-sm" onClick={() => navigate(`/project/internal-external/update/${id}`)}>
                <FaEdit /> Edit
              </button>
            </div>
          }
        </div>

        <div className="mb-2 class-page-container">
          <div className="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center d-print-none p-2 rounded text-dark gap-2">
            <button className="btn btn-dark btn-sm d-flex flex-column align-items-center small-btn" onClick={sharePDF}>
              <FaShare />
              <span className="small-text">Share</span>
            </button>

            <button className="btn btn-danger btn-sm d-flex flex-column align-items-center small-btn" onClick={downloadPDF}>
              <FaFilePdf />
              <span className="small-text">PDF</span>
            </button>

            <button className="btn btn-success btn-sm d-flex flex-column align-items-center small-btn" onClick={downloadExcel}>
              <FaFileExcel />
              <span className="small-text">Excel</span>
            </button>

            <button className="btn btn-primary btn-sm d-flex flex-column align-items-center small-btn" onClick={downloadImage}>
              <FaImage />
              <span className="small-text">Image</span>
            </button>

            <button className="btn btn-outline-dark btn-sm d-flex flex-column align-items-center small-btn" onClick={handlePrint}>
              <FaPrint />
              <span className="small-text">Print</span>
            </button>
          </div>
        </div>

        <div className="bg-white py-4  mb-5 time-div-1" style={{ position: "relative", minHeight: "500px" }}>
          <div id="bvcoe-timetable" className="p-4 border border mx-auto time-div-2" style={{ maxWidth: "1050px", color: "black" }}>
            <div className="text-center mb-4">
              <img src="https://tse4.mm.bing.net/th/id/OIP.0VFIMCOrCqZVFEEPzXDtcgHaDh?pid=Api&P=0&h=180"
                alt="Logo" style={{ height: "70px" }} className="mb-2" />
              <h4 className="fw-bold mb-0">Bharati Vidyapeeth's College of Engineering, Kolhapur</h4>
              <p className="mb-0 fw-bold text-uppercase">Department of Computer Science and Engineering</p>

              <div className="d-flex justify-content-between mt-3 py-2 fw-bold small">
                <span>Sem - VIII</span>
                <span>Academic Year : 2025-26</span>
                <span>
                  Date : {new Date(project.examDates[0].date).toLocaleDateString('en-GB')} To {new Date(project.examDates[project.examDates.length - 1].date).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div className="d-flex justify-content-center fw-bold small">

                <h5 className="mt-3 fw-bold ">{project.projectName} Time Table</h5>
              </div>
            </div>


            <div className="table-responsive">
              <table id="timetable-table" className="text-center align-middle custom-table">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Class</th>
                    <th>Batch</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody className="border-3">
                  {generateTableRows()}
                </tbody>
              </table>
            </div>

             <div className="d-flex justify-content-between mt-5 pt-4 px-3 fw-bold text-uppercase small">
              <div className="text-center"><div style={{ height: '40px' }}></div><p>Exam Coordinator</p></div>
              <div className="text-center"><div style={{ height: '40px' }}></div><p>H.O.D.</p></div>
              <div className="text-center"><div style={{ height: '40px' }}></div><p>Principal</p></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-table {
          border-collapse: collapse !important;
          width: 100% !important;
          background-color: white !important;
        }
        .custom-table th, .custom-table td { 
          border: 1px solid black !important; 
          font-family: 'Inter', sans-serif !important;
          vertical-align: middle !important;
          padding: 8px !important;
          background-clip: padding-box; /* Fix for rowSpan border leaking */
        }
        .custom-table thead th {
          background-color: #f8f9fa !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          text-transform: uppercase;
        }
        .bg-light { background-color: #f8f9fa !important; }
        .fw-bold { font-weight: 700 !important; }
        .time-div-2 { box-shadow: none !important; border: none !important; }
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