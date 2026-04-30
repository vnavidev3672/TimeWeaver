import React, { useState } from "react";
import config from "../../config";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Layout from "../../Component/Layout/Layout"; 
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !val.includes("@")) setEmailSuggestion(val + "@gmail.com");
    else setEmailSuggestion("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) return toast.error("Email must be Gmail");

    try {
      const res = await axios.post(`${config.API_BASE_URL}/auth/forgot-password`, {
        email,
        answer,
        newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center">
        <div
          className="login-box p-4 p-md-5 rounded-4 shadow-lg w-100"
          style={{ maxWidth: "450px", backgroundColor: "#ffffff" }}
        >
          <h2 className="text-dark fw-bold mb-2">Reset Password</h2>
          <p className="text-secondary small mb-4">
            Enter your details below to securely reset your account password.
          </p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <label className="w-100 position-relative">
              <p className="mb-1 small text-dark opacity-75">
                Email Address <span className="text-danger">*</span>
              </p>
              <input
                required
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className="form-control text-dark border-secondary py-2"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
              {emailSuggestion && (
                <div
                  className="position-absolute bg-white border shadow-sm p-2 mt-1 rounded w-100"
                  style={{ zIndex: 10, cursor: "pointer", fontSize: "0.85rem" }}
                  onClick={() => {
                    setEmail(emailSuggestion);
                    setEmailSuggestion("");
                  }}
                >
                  Suggest: <span className="text-primary">{emailSuggestion}</span>
                </div>
              )}
            </label>

            <label className="w-100">
              <p className="mb-1 small text-dark opacity-75">
                What is your security answer? <span className="text-danger">*</span>
              </p>
              <input
                required
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter security answer"
                className="form-control text-dark border-secondary py-2"
                style={{ backgroundColor: "#fcfdff", border: "1px solid #91a7d2" }}
              />
            </label>

            <label className="w-100 position-relative">
              <p className="mb-1 small text-dark opacity-75">
                New Password <span className="text-danger">*</span>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
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

            <button
              type="submit"
              className="btn btn-warning w-100 fw-bold py-2 mt-2 rounded-2"
              style={{ backgroundColor: "#FFD60A", color: "#000814", border: "none" }}
            >
              Reset Password
            </button>

            <div className="text-center mt-3">
              <span className="text-secondary small">Remembered password? </span>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <span className="text-info small fw-bold">Login Now</span>
              </Link>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        .form-control::placeholder {
          color: #adb5bd;
          font-size: 0.9rem;
        }
        .form-control:focus {
          border-color: #FFD60A;
          box-shadow: none;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
};

export default ForgotPassword;