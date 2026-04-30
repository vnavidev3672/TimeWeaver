import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaArrowRight, FaSearch, FaUniversity } from "react-icons/fa";
import Layout from "../Component/Layout/Layout";
import { useAuth } from '../context/auth';
import "../Styles/HomePageStyle.css";
import toast from "react-hot-toast";

const AllProjects = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const [currentFilter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const tabsName = ["All", "Internal-External", "Unit-Test", "Academic"];

  const filteredProjects = projects.filter((project) => {
    const matchesTab = currentFilter === "All" || project.projectCategory === currentFilter;
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getAllProjects = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/auth/projects`);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  const deleteProject = async (id, category) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this project?");

    if (!isConfirmed) {
      return;
    }

    let catCode = "";
    if (category.toLowerCase() === "academic") catCode = "ac";
    else if (category.toLowerCase() === "unit-test") catCode = "ut";
    else catCode = "ie";

    try {
      const res = await axios.delete(`${config.API_BASE_URL}/${catCode}/delete/${id}`);

      if (res.status === 200) {
        toast.success(`${category} project deleted successfully!`);
        getAllProjects();
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete project. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container">
        <h1 className="fw-bold">
          All <span style={{ color: "#10b981" }}>Time-Tables</span>
        </h1>

        <div className="row g-3 mb-5 align-items-center">
          <div className="col-lg-4">
            <div className="d-flex gap-2 p-1 rounded-pill bg-light border overflow-auto shadow-sm" style={{ maxWidth: "100%" }}>
              {tabsName.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`btn btn-sm px-2 py-2 rounded-pill transition-all border-0 ${currentFilter === tab ? "bg-white shadow-sm fw-bold" : "text-muted"
                    }`}
                  style={{
                    color: currentFilter === tab ? "#10b981" : "#6c757d",
                    whiteSpace: "nowrap"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="col-lg-3">
            <div className="input-group rounded-pill border px-3 py-1 bg-light shadow-sm">
              <span className="input-group-text bg-transparent border-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0 shadow-none"
                placeholder="Search schedule name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row g-4">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="col-lg-4 col-md-6"
              >
                <div className="card h-100 border-0 shadow-sm p-4 rounded-4 project-card-hover">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: "#10b98115",
                        color: "#10b981",
                        border: "1px solid #10b98133",
                      }}
                    >
                      #{project.projectCategory}
                    </span>
                    <FaUniversity className="text-light-emphasis" />
                  </div>

                  <div className="mb-3">
                    <h5 className="fw-bold text-dark mb-">Project Name : {project.projectName}</h5>
                    <small className="text-muted">
                      <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                    </small>
                  </div>


                  <div className="d-flex gap-2">
                    <div className="col-4">
                      <button
                        className="btn w-100 rounded-pill fw-bold py-2 mt-auto btn-emerald"
                        onClick={() =>
                          navigate(`/project/${project.projectCategory.toLowerCase()}/view/${project._id}`)
                        }
                      >
                        View
                      </button>
                    </div>
                    {auth.user.role === 1 &&
                      <div className="col-7 d-flex gap-2">
                        <button
                          className="btn w-100 rounded-pill fw-bold py-2 mt-auto btn-outline-success"
                          onClick={() =>
                            navigate(`/project/${project.projectCategory.toLowerCase()}/update/${project._id}`)
                          }
                        >
                          Update
                        </button>

                        <button
                          className="btn w-100 rounded-pill fw-bold py-2 mt-auto btn-outline-danger"
                          onClick={() => deleteProject(project._id, project.projectCategory)}
                        >
                          Delete
                        </button>
                      </div>
                    }

                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-5 mt-4">
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.uj8hQstb6rRudXI_gELm6gHaHa?pid=Api&P=0&h=180"
              alt="Empty"
              style={{ width: '150px', opacity: 0.5 }}
            />
            <h4 className="text-muted mt-3">No schedules found for "{currentFilter}"</h4>
            <p className="text-muted">Try changing your search or filter settings.</p>
          </div>
        )}
      </div>

      <style>{`
        .btn-emerald {
          background-color: #10b981;
          color: white;
          border: none;
          transition: all 0.3s ease;
        }
        .btn-emerald:hover {
          background-color: #059669;
          color: white;
          transform: translateY(-2px);
        }
        .project-card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .project-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Layout>
  );
};

export default AllProjects;