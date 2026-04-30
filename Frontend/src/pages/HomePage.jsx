import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import config from "../config";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaChalkboardTeacher, FaCalendarAlt, FaTasks, FaUsers,
  FaPlus, FaWhatsapp, FaEnvelope, FaGraduationCap,
  FaArrowRight, FaRobot
} from "react-icons/fa";
import Layout from "../Component/Layout/Layout";
import { useAuth } from '../context/auth';
import NewProject from './NewProject';
import "../Styles/HomePageStyle.css";
import TimeTableBlock from "../Component/HomePage/TimeTableBlock";
import About from "../Component/HomePage/About";
import Contact from "../Component/HomePage/Contact";

const HomePage = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [visibleCount] = useState(6);

  const getAllProjects = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/auth/projects`);
      if (res.data.success) setProjects(res.data.projects);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { getAllProjects(); }, []);

  return (
    <Layout title="AI TimeWeaver - BVCOE Kolhapur">
      <div className="hero-gradient">
        <section className="container mb-5">
          <div className="row align-items-center ">

            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="display-4 fw-bold text-dark-blue lh-sm">
                Empower BVCOEK Education with <br />
                <span className="text-emerald">Automated Timetables</span>
              </h1>

              <p className="text-muted mt-4 mb-4 fs-5 mx-auto mx-lg-0" style={{ maxWidth: "550px" }}>
                Our AI engine intelligently allocates faculty, labs, and classrooms to
                create conflict-free academic timetables for Bharati Vidyapeeth
                Engineering College.
              </p>

              {auth?.user?.role === 1 &&
                <div className="d-flex gap-3 justify-content-center justify-content-lg-start flex-wrap">
                  <button
                    className="btn btn-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => {
                      const element = document.getElementById("new-project");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Generate Timetable <FaArrowRight />
                  </button>
                </div>
              }
            </div>

            <div className="col-lg-6">
              <TimeTableBlock
                accentColor="text-emerald"
                backgroundGradient={<div className="timetable-blob"></div>}
              />
            </div>
          </div>

          <div className="hero-ai-visual mt-5 rounded-4 overflow-hidden d-none d-md-block">
            <div className="overlay-box d-flex flex-column align-items-center justify-content-center text-center p-5">
              <FaRobot size={60} className="text-emerald mb-3" />
              <h3 className="text-white">AI Timetable Engine</h3>
              <p className="text-light opacity-75">
                Optimizing schedules across BVCOE departments
              </p>
            </div>
          </div>

        </section>

        {auth?.user?.role === 1 && (
          <section className="my-5" id="new-project">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <NewProject />
            </motion.div>
          </section>
        )}

        <About className="mt-5" />

        <Contact />

      </div>
    </Layout>
  );
};





export default HomePage;