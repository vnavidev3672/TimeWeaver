import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Layout from "../../Component/Layout/Layout";
import { FaEdit, FaPlus, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import axios from "axios";

const Dashboard = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  const getUser = async () => {
    try {
      const res = await axios.get(
        `${config.API_BASE_URL}/auth/view/${auth.user._id}`
      );

      if (res.data.success) {
        setTimeout(() => {
          setUserData(res.data.user);
        }, 1000);
      }
    } catch (err) {
      console.log("Error fetching user:", err);
      setLoading(false);
    }
  };


  useEffect(() => {
    getUser();
  }, []);

  return (
    <Layout title="My Profile">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="bg-success bg-gradient text-white text-center p-4">
                {userData?.photo ? (
                  <img
                    src={userData.photo}
                    alt="profile"
                    className="rounded-circle shadow border border-3 border-white"
                    style={{ width: 110, height: 110, objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle size={110} className="text-white" />
                )}

                <h5 className="fw-bold mt-3 mb-0">
                  {userData?.name || "Loading..."}
                </h5>

                <small>{userData?.email}</small>

                <div className="mt-2">
                  <span
                    className={`badge px-3 py-2 ${userData?.role === 0 ? "bg-light text-success" : "bg-primary"
                      }`}
                  >
                    {userData?.role === 0 ? "User" : "Admin"}
                  </span>
                </div>
              </div>

               <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label text-muted small">Full Name</label>
                  <div className="form-control bg-light">
                    {userData?.name}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Email Address</label>
                  <div className="form-control bg-light">
                    {userData?.email}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    className="btn btn-success"
                    onClick={() => navigate(`/profile/edit/${userData?._id}`)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );

};

export default Dashboard;
