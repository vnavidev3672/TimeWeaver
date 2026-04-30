import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import config from "../../config";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Layout from "../../Component/Layout/Layout";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const { email, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.API_BASE_URL}/auth/login`, {

        email,
        password,
      });
      if (res?.data?.success) {
        setAuth({ ...auth, user: res.data.user, token: res.data.token });
        localStorage.setItem("auth", JSON.stringify(res.data));
        toast.success("Login Successful");
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during login");
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center ">
      <div className="login-box p-4 p-md-5 rounded-4 shadow-lg w-100" style={{ maxWidth: "450px", backgroundColor: "#ffffff" }}>
        
        <h2 className="text-dark fw-bold mb-2">Welcome Back</h2>
        <p className="text-secondary small mb-4">
          Precision scheduling and academic management starts here.
        </p>

        <form onSubmit={handleOnSubmit} className="d-flex flex-column gap-3">
          
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
              className="form-control text-dark border-secondary py-2"
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
              placeholder="Enter Password"
              className="form-control text-dark border-secondary py-2 pe-5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #424854" }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="position-absolute end-0 top-50 mt-2 translate-middle-y me-3 cursor-pointer text-secondary"
              style={{ zIndex: 10, cursor: "pointer" }}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={20} />
              ) : (
                <AiOutlineEye fontSize={20} />
              )}
            </span>
          </label>

          <div className="text-end">
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <small className="text-info">Forgot Password?</small>
            </Link>
          </div>

           <button
            type="submit"
            className="btn btn-warning w-100 fw-bold py-2 mt-2 rounded-2"
            style={{ backgroundColor: "#FFD60A", color: "#000814", border: "none" }}
          >
            Sign In
          </button>

           <div className="text-center mt-3">
            <span className="text-secondary small">Don't have an account? </span>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <span className="text-info small fw-bold">Register Now</span>
            </Link>
          </div>

        </form>
      </div>

      <style>{`
        .bg-dark-blue {
          background-color: #f1f3f5;
        }
        .form-control::placeholder {
          color: #000000;
          font-size: 0.9rem;
        }
        .form-control:focus {
          background-color: #ffffff;
          color: white;
          border-color: #FFD60A;
          box-shadow: none;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
    </Layout>
  );
};

export default Login;