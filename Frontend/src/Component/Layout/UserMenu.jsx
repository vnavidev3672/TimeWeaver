import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import {
  FaUser, FaEnvelope, FaSignOutAlt, FaRocket,
  FaShieldAlt, FaChevronRight, FaCamera, FaProjectDiagram
} from "react-icons/fa";
import config from "../../config";
import axios from "axios";

const UserMenu = () => {
  const [auth, setAuth] = useAuth();
  const userId = auth?.user?._id;
  const [admins, setAdmins] = useState([]);
  const [unitTests, setUnitTests] = useState([]);
  const [ieProjects, setIeProjects] = useState([]);
  const [academicProjects, setAcademicProjects] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {

    toast((t) => (
      <div>
        <p className="mb-2">
          Are you sure you want to logout?
        </p>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              toast.dismiss(t.id);

              setAuth({ ...auth, user: null, token: "" });
              localStorage.removeItem("auth");

              toast.success("Logout Successfully 👋");
              navigate("/login");
            }}
          >
            Yes, Logout
          </button>
        </div>
      </div>
    ));

  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = config.API_BASE_URL;
        const [utRes, ieRes, acRes, usersRes] = await Promise.all([
          axios.get(`${baseUrl}/ut/user/${userId}`),
          axios.get(`${baseUrl}/ie/user/${userId}`),
          axios.get(`${baseUrl}/ac/user/${userId}`),
          auth.user.role === 0 ? axios.get(`${baseUrl}/auth/view-users`) : Promise.resolve({ data: { users: [] } })
        ]);

        if (utRes.data?.success) setUnitTests(utRes.data.projects);
        if (ieRes.data?.success) setIeProjects(ieRes.data.projects);
        if (acRes.data?.success) setAcademicProjects(acRes.data.projects);
        if (usersRes.data?.success) setAdmins(usersRes.data.users.filter(u => u.role === 1));
      } catch (err) { console.error(err); }
    };

    if (userId && auth?.token) fetchData();
  }, [userId, auth?.token]);

  if (!auth?.user) return null;

  return (
    <div className="menu-card shadow-lg border-0 overflow-hidden">

      <div className="profile-header text-center p-4">
        <div className="avatar-wrapper position-relative mx-auto mb-3">
          <img
            src={auth.user.profileImage || "https://www.pngmart.com/files/23/Profile-PNG-Photo.png"}
            alt="profile"
            className="rounded-circle profile-img border border-3 border-white shadow"
          />
          <div className="online-indicator"></div>
        </div>
        <h5 className="fw-bold text- mb-0">{auth.user.name}</h5>
        <p className="mb-0">{auth.user.email}</p>
        <span className="badge bg-success rounded-pill px-3 py-1 small mt-2">
          {auth.user.role === 1 ? "Faculty Member" : "Portal User"}
        </span>
      </div>

      <div className="p-4 bg-white">
        <div className="row g-2 mb-4">
          <div className="col-6">
            <Link to={`/profile/${userId}`} className="action-btn">
              <FaUser className="mb-1" />
              <span>Profile</span>
            </Link>
          </div>
          <div className="col-6">
            <button onClick={handleLogout} className="action-btn logout">
              <FaSignOutAlt className="mb-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {auth.user.role === 1 ? (
          <div className="section-wrapper">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaProjectDiagram className="text-primary" />
              <h6 className="fw-bold mb-0">Project Insights</h6>
            </div>

            <div className="project-stat-card mb-2">
              <span>Unit Tests</span>
              <span className="count">{unitTests.length}</span>
            </div>
            <div className="project-stat-card mb-2">
              <span>Internal-External</span>
              <span className="count">{ieProjects.length}</span>
            </div>
            <div className="project-stat-card mb-4">
              <span>Academic</span>
              <span className="count">{academicProjects.length}</span>
            </div>
          </div>
        ) : (
          <div className="section-wrapper">
            <div className="d-flex align-items-center gap-2 mb-3 text-success">
              <FaShieldAlt />
              <h6 className="fw-bold mb-0">Admin Support</h6>
            </div>
            {admins.slice(0, 2).map(admin => (
              <div key={admin._id} className="admin-pill p-2 mb-2 d-flex align-items-center gap-2">
                <div className="admin-initial">{admin.name.charAt(0)}</div>
                <div className="overflow-hidden">
                  <p className="mb-0 fw-bold small text-truncate">{admin.name}</p>
                  <p className="mb-0 text-muted extra-small text-truncate">{admin.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-top text-center">
          <Link to="/contact" className="text-decoration-none text-primary small fw-bold">
            Need Help? Contact Team <FaChevronRight size={10} />
          </Link>
        </div>
      </div>

      <style>{`
        .menu-card {
          border-radius: 20px;
          background: #fff;
          transition: 0.3s;
        }
         
        .profile-img {
          width: 90px;
          height: 90px;
          object-fit: cover;
        }
        .avatar-wrapper {
          width: fit-content;
        }
        .online-indicator {
          width: 15px;
          height: 15px;
          background: #2ecc71;
          border: 2px solid #fff;
          border-radius: 50%;
          position: absolute;
          bottom: 5px;
          right: 5px;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 12px;
          background: #f8f9fa;
          color: #333;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          width: 100%;
          transition: 0.2s;
        }
        .action-btn:hover {
          background: #fff;
          border-color: #3e567a;
          transform: translateY(-2px);
        }
        .action-btn.logout:hover {
          background: #fff5f5;
          border-color: #ff4d4d;
          color: #ff4d4d;
        }
        .project-stat-card {
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
        }
        .count {
          background: #000814;
          color: #fff;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
        }
        .admin-pill {
          background: #eef2f3;
          border-radius: 10px;
        }
        .admin-initial {
          width: 30px;
          height: 30px;
          background: #000814;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .extra-small { font-size: 10px; }
      `}</style>
    </div>
  );
};

export default UserMenu;