import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/Header.css";
import { useAuth } from "../../context/auth";
import UserMenu from "./UserMenu";
import config from "../../config";
import axios from "axios";
import {
  FaPlus,
  FaUsers,
  FaUniversity,
  FaBook,
  FaCalendarAlt,
  FaUserCircle,
  FaSignInAlt,
} from "react-icons/fa";

const Header = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  const getUserDetails = async () => {
    if (!auth?.user?._id) return;
    try {
      const { data } = await axios.get(
        `${config.API_BASE_URL}/auth/view/${auth.user._id}`
      );
      setRole(data.user.role);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, [auth?.user]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light shadow sticky-top">
        <div className="container px-3 d-flex align-items-center justify-content-between">
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center fw-bold symbol mb-0"
          >
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.oX3DrwhH69EQRrZIekQ9FgHaFk?pid=Api"
              width="40"
              height="40"
              alt="logo"
              className="me-2"
            />
            <span className="text-info">TimeWeaver</span>
          </Link>

           <div className="d-flex align-items-center gap-2">
            {role === 0 && (
              <Link to="/all-projects" className="projects-btn">
                Projects
              </Link>
            )}

            {role === 1 && (
              <>
                <Link to="/all-projects" className="projects-btn">
                  Projects
                </Link>

                <Link to="/view-users" className="projects-btn">
                  Users
                </Link>
              </>
            )}

            {auth?.user ? (
              <button
                className="user-responsive-btn"
                data-bs-toggle="offcanvas"
                data-bs-target="#userSidebarSmall"
              >
                <div className="user-avatar-circle">
                  {auth.user.name?.charAt(0).toUpperCase()}
                </div>

                <span className="user-name d-none d-md-inline ms-1">
                  {auth.user.name}
                </span>
              </button>
            ) : (
              <Link to="/login" className="projects-btn">
                <FaSignInAlt className="me-1" />
                Connect
              </Link>
            )}

          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end bg-light"
        tabIndex="-1"
        id="userSidebarSmall"
      >
        <div className="offcanvas-header border-bottom border-secondary">
          <h6 className="offcanvas-title">
            👋 Hello, {auth?.user?.name || "Guest"}
          </h6>
          <button
            type="button"
            className="btn-close btn-close-dark"
            data-bs-dismiss="offcanvas"
          />
        </div>
        <div className="offcanvas-body">
          <UserMenu />
        </div>
      </div>
    </>
  );
};

export default Header;
