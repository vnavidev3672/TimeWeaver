import React from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaEnvelope, FaGithub, FaLinkedinIn, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-5 pb-3 border-top border-secondary">
      <div className="container">
        <div className="row g-4">
          
           <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold mb-3">Time<span className="text-warning">Weaver</span></h4>
            <p className="text-secondary small" style={{ lineHeight: "1.7" }}>
              Revolutionizing academic scheduling for BVCOE Kolhapur using AI-driven precision. 
              Reducing manual effort and eliminating conflicts for a smarter campus.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-secondary hover-white"><FaLinkedinIn size={20} /></a>
              <a href="#" className="text-secondary hover-white"><FaGithub size={20} /></a>
              <a href="https://wa.me/9763791406" className="text-secondary hover-white"><FaWhatsapp size={20} /></a>
            </div>
          </div>

           <div className="col-lg-2 col-md-6 ms-lg-auto">
            <h6 className="fw-bold text-uppercase mb-3 small tracking-widest">Navigation</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none small hover-white">Home</Link></li>
               <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none small hover-white">Faculty Login</Link></li>
              <li className="mb-2"><Link to="/register" className="text-secondary text-decoration-none small hover-white">Registration</Link></li>
            </ul>
          </div>

           <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-uppercase mb-3 small tracking-widest">Contact Support</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-3 d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-warning" />
                <span>BVCOE, Near Chitranagari, <br />Kolhapur, Maharashtra 416013</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-2">
                <FaEnvelope className="text-warning" />
                <a href="mailto:shraddha.patil5242@gmail.com" className="text-secondary text-decoration-none hover-white">
                  shraddha.patil5242@gmail.com
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaWhatsapp className="text-warning" />
                <span>+91 9763791406</span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="my-4 border-secondary opacity-25" />

         <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-secondary small mb-0">
              © {new Date().getFullYear()} TimeWeaver AI. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <p className="text-secondary small mb-0">
              Developed with ❤️ by <span className="text-white fw-bold">Shraddha & Team</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        footer {
          font-family: 'Inter', sans-serif;
        }
        .hover-white:hover {
          color: #ffffff !important;
          transition: 0.3s ease;
        }
        .tracking-widest {
          letter-spacing: 0.1rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;