import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFlask, FaBook, FaUniversity, FaChalkboardTeacher, FaClipboardList, FaCheckCircle, FaArrowRight } from "react-icons/fa";

 const HighlightText = ({ text }) => (
  <span style={{
    background: "linear-gradient(118.41deg, #1FA2FF 10.05%, #12D8FA 40.58%, #A6FFCB 95.7%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  }} className="font-bold">
    {" "}{text}
  </span>
);

const SelectTimeTableType = () => {
  const navigate = useNavigate();
  const tabsName = ["All", "Examination", "Academic"];
  const [currentTab, setCurrentTab] = useState(tabsName[0]);

  const allTypes = [
    {
      title: "Unit Test Time Table",
      description: "Designate structured schedules for periodic departmental unit tests. This engine meticulously balances multiple subjects within a condensed timeframe, ensuring that different batches can undergo assessments simultaneously without any classroom overlaps.",
      icon: <FaFlask />,
      route: "unit-test",
      points: ["Batch-wise Separation", "Classroom Optimization", "Short-term Balancing"],
      tag: "Examination"
    },
    {
      title: "Internal Exam",
      description: "Generate comprehensive mid-term and continuous assessment schedules tailored for departmental excellence. The system intelligently maps faculty supervisors to specific blocks and monitors classroom capacities.",
      icon: <FaBook />,
      route: "internal-external",
      points: ["Faculty Supervision Mapping", "Seating Capacity Analysis", "Automated Invigilation"],
      tag: "Examination"
    },
    {
      title: "External Exam",
      description: "Manage high-stakes University end-semester examinations and final practical sessions with absolute precision. This module adheres strictly to university regulatory frameworks while optimizing laboratory resources.",
      icon: <FaUniversity />,
      route: "internal-external",
      points: ["University Norm Compliance", "Lab Resource Scheduling", "External Examiner Sync"],
      tag: "Examination"
    },
    {
      title: "Academic Schedule",
      description: "The core academic engine designed for complex weekly lectures, practicals, and tutorial sessions. It deep-analyzes faculty workload, specialized laboratory requirements, and elective student choices.",
      icon: <FaChalkboardTeacher />,
      route: "academic",
      points: ["Load Balancing (Theory/Lab)", "Elective Batch Management", "Workload Distribution"],
      tag: "Academic"
    }
    // {
    //   title: "Teacher Allotment",
    //   description: "Optimize faculty resource management by automating exam supervision duties and lecture workload mapping. This module ensures a completely equitable distribution of administrative and academic responsibilities.",
    //   icon: <FaClipboardList />,
    //   route: "semester-allotment",
    //   points: ["Equitable Duty Allotment", "Real-time Faculty Tracking", "Staff Workload Analytics"],
    //   tag: "Staff"
    // }
  ];

   const filteredTypes = currentTab === "All"
    ? allTypes
    : allTypes.filter(type => type.tag === currentTab);

  const [currentCard, setCurrentCard] = useState(allTypes[0].title);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <div className="container-fluid py-5">

         <div className="text-center mb-5 mt-4">
          <h1 className="display-5 fw-bold mb-2 text-dark">
            Unlock the <HighlightText text="Power of Automation" />
          </h1>
          <p className="text-muted fs-5 fw-medium">
            Learn to build conflict-free schedules for BVCOE
          </p>

          <div className="mx-auto mt-3" style={{
            width: '60px',
            height: '4px',
            background: '#10b981',
            borderRadius: '2px'
          }}></div>
        </div>

         <div className="d-flex justify-content-center mb-5 px-3">
          <div className="d-flex gap-2 p-1 rounded-pill shadow-sm" style={{ backgroundColor: "#f1f3f5", border: "1px solid #dee2e6" }}>
            {tabsName.map((tab, index) => (
              <button
                key={index}
                onClick={() => setCurrentTab(tab)}
                className={`btn btn-sm px-3 px-md-4 py-2 rounded-pill transition-all border-0 ${currentTab === tab ? "bg-white text-dark fw-bold shadow-sm" : "text-secondary"
                  }`}
                style={{ fontSize: "13px" }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

         <div className="row g-4 g-lg-5 justify-content-center pt-2 mx-lg-5 px-3">
          {filteredTypes.map((card, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-12 col-md-6 col-lg-4"
              onClick={() => setCurrentCard(card.title)}
            >
              <div
                className="border border-2 p-3 p-md-4 transition-all position-relative"
                style={{
                  cursor: "pointer",
                   backgroundColor: currentCard === card.title ? "#FFFFFF" : "#161D29",
                  color: currentCard === card.title ? "#212529" : "#AFB2BF",
                  boxShadow: currentCard === card.title ? "12px 12px 0px 0px #e7d50fff" : "none",
                  borderColor: currentCard === card.title ? "#e7d50fff" : "#2C333F",
                  borderRadius: "0px",
                  minHeight: window.innerWidth < 768 ? "250px" : "340px",
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: currentCard === card.title ? "70px" : "20px",
                  marginBottom: "15px"
                }}
              >
                <div
                  className="pb-3 mb-3"
                  style={{ borderBottom: `2px dashed ${currentCard === card.title ? "#dee2e6" : "#2C333F"}` }}
                >
                  <h3
                    className={`fw-bold mb-2 d-flex align-items-center gap-2 ${currentCard === card.title ? "text-dark" : "text-white"
                      }`}
                    style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)" }}
                  >
                    <span style={{ color: "#10b981" }}>{card.icon}</span>
                    {card.title}
                  </h3>

                   <p
                    className={`lh-base mb-0 ${currentCard === card.title ? "text-muted" : "text-secondary"
                      }`}
                    style={{ textAlign: "justify", fontSize: "13px" }}
                  >
                    {card.description}
                  </p>
                </div>

                 <div className="mt-1 flex-grow-1  d-none d-lg-block">
                  {card.points.map((point, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center gap-2 mb-2 small fw-bold"
                      style={{ color: currentCard === card.title ? "#212529" : "#AFB2BF" }}
                    >
                      <FaCheckCircle style={{ color: "#10b981", fontSize: "14px" }} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                 {currentCard === card.title && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/project/${card.route}/create`);
                    }}
                    className="btn w-100 rounded-0 fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      position: "absolute",
                      bottom: "0px",
                      left: "0",
                    }}
                  >
                    START GENERATING <FaArrowRight />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        /* Fix for Horizontal scroll on mobile */
        @media (max-width: 768px) {
          .rounded-pill.d-flex {
            overflow-x: auto;
            white-space: nowrap;
            max-width: 90vw;
          }
          h1.display-5 { font-size: 1.8rem !important; }
        }
        .transition-all { transition: all 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default SelectTimeTableType;