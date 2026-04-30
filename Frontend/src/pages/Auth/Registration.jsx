import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import config from "../../config";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Layout from "../../Component/Layout/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    answer: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { name, email, password ,answer} = formData;
  const [auth, setAuth] = useAuth();

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password,answer };
      const res = await axios.post(`${config.API_BASE_URL}/auth/register`, payload);


      if (res.data.success) {
        setAuth({ ...auth, user: res.data.user, token: res.data.token });
        localStorage.setItem("auth", JSON.stringify(res.data));
        toast.success(res.data.message);
        navigate("/");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during registration");
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center py- bg-light-gray" style={{ minHeight: "80vh" }}>
        <div className="login-box p-4 p-md-5 rounded-4 shadow-lg w-100" style={{ maxWidth: "450px", backgroundColor: "#ffffff" }}>
          
          <h2 className="text-dark fw-bold mb-2 text-center">Create Account</h2>
          <p className="text-secondary small mb-4 text-center">
            Join TimeWeaver for smart academic scheduling.
          </p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            
             <label className="w-100">
              <p className="mb-1 small text-dark opacity-75">
                Full Name <span className="text-danger">*</span>
              </p>
              <input
                required
                type="text"
                name="name"
                value={name}
                onChange={handleOnChange}
                placeholder="Enter your full name"
                className="form-control border-secondary py-2"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
            </label>

             <label className="w-100">
              <p className="mb-1 small text-dark opacity-75">
                Email Address <span className="text-danger">*</span>
              </p>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="form-control border-secondary py-2"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
            </label>

             <label className="w-100 position-relative">
              <p className="mb-1 small text-dark opacity-75">
                Password <span className="text-danger">*</span>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Create Password"
                className="form-control border-secondary py-2 pe-5"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="position-absolute end-0 top-50 mt-2 translate-middle-y me-3"
                style={{ zIndex: 10, cursor: "pointer", color: "#6c757d" }}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={20} />
                ) : (
                  <AiOutlineEye fontSize={20} />
                )}
              </span>
            </label>


             <label className="w-100">
              <p className="mb-1 small text-dark opacity-75">
                Secrete Key <span className="text-danger">*</span>
              </p>
              <input
                required
                type="text"
                name="answer"
                value={answer}
                onChange={handleOnChange}
                placeholder="Enter Secrete key for Forg0t PassWord"
                className="form-control border-secondary py-2"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
            </label>
            
                        <button
              type="submit"
              className="btn btn-warning w-100 fw-bold py-2 mt-3 rounded-2"
              style={{ backgroundColor: "#FFD60A", color: "#000814", border: "none" }}
            >
              Register Now
            </button>

             <div className="text-center mt-3">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <span className="text-info small fw-bold">Login</span>
              </Link>
            </div>

          </form>
        </div>

        <style>{`
          .bg-light-gray {
            background-color: #f8f9fa;
          }
          .form-control:focus {
            background-color: #ffffff;
            border-color: #FFD60A;
            box-shadow: 0 0 0 0.25rem rgba(255, 214, 10, 0.25);
          }
          .form-control::placeholder {
            color: #adb5bd;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Register;