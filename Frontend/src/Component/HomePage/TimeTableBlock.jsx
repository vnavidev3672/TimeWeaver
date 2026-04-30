import React from "react";
import { TypeAnimation } from "react-type-animation";
import { FaCalendarCheck } from "react-icons/fa";
import "../../Styles/TimeTableBlock.css";

const TimeTableBlock = ({
  backgroundGradient,
  accentColor = "text-emerald",
}) => {
  
  const tableData = `
  [AI]: BVCOEK Schedule Optimized...

+----+-------+---------+--------------+-------+
| NO | TIME  | SUBJECT | TEACHER      | ROOM  |
+----+-------+---------+--------------+-------+
| 01 | 09:15 | CPP     | R. V. Jadhav | LH-1  |
| 02 | 10:15 | JS      | R. M. Mane   | LH-2  |
| 03 | 11:15 | JAVA    | S. B. Patil  | LH-3  |
| 04 | 14:00 | C       | D. A. Alone  | LH-4  |
+----+-------+---------+--------------+-------+
`;

  return (
    <div className="terminal-wrapper p-2 p-md-0">
      <div className="terminal-card position-relative shadow-2xl overflow-hidden rounded-4">
        {backgroundGradient}

        <div className="terminal-header d-flex align-items-center px-3 py-2 border-bottom border-secondary bg-dark-subtle opacity-75">
          <div className="d-flex gap-1 me-3">
            <span className="dot bg-danger"></span>
            <span className="dot bg-warning"></span>
            <span className="dot bg-success"></span>
          </div>
          <FaCalendarCheck className="text-emerald me-2" />
          <span className="small font-monospace text-secondary">AI_SCHEDULER_BVCOE.log</span>
        </div>

        <div className="terminal-body p-3 p-md-4 bg-dark">
          <TypeAnimation
            sequence={[tableData, 3000, ""]}
            repeat={Infinity}
            cursor
            style={{
              whiteSpace: "pre", 
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: "clamp(9px, 1.5vw, 13px)",  
              display: "block",
              lineHeight: "1.6",
              letterSpacing: "0px"
            }}
            className={accentColor}
            omitDeletionAnimation
          />
        </div>
      </div>
    </div>
  );
};

export default TimeTableBlock;