import React, { useState } from "react";
import Layout from "../../Component/Layout/Layout";
import { FaUserCircle, FaSave } from "react-icons/fa";

const EditProfile = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Data:", formData);
  };

  return (
    <Layout title="Edit Profile">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
             
              <div className="bg-success bg-gradient text-white text-center p-4">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="preview"
                    className="rounded-circle shadow border border-3 border-white"
                    style={{ width: 110, height: 110, objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle size={110} />
                )}
                <h5 className="fw-bold mt-3 mb-0">Edit Profile</h5>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-success rounded-pill"
                    >
                      Update Profile
                    </button>
                  </div>

                </form>

              </div>
              
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
