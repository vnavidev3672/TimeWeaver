import React, { useState } from 'react';
import { motion } from "framer-motion";
import { FaWhatsapp, FaEnvelope, FaArrowRight } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const phoneNumber = "919763791406"; 

  const handleWhatsApp = (e) => {
    e.preventDefault();
     const text = `Hello, I am ${formData.name}. %0aMessage: ${formData.message}`;
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <section className="py-5 bg-white position-relative overflow-hidden">
       <div className="position-absolute bottom-0 end-0 translate-middle bg-secondary opacity-10 rounded-circle" style={{ width: '300px', height: '300px', filter: 'blur(100px)' }}></div>

      <div className="container py-lg-5 position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
             <div className="text-center mb-5">
              <h6 className="fw-bold text-uppercase tracking-widest mb-3 text-secondary">Get In Touch</h6>
              <h2 className="fw-bold display-5 text-dark">
                Contact <span className="text-black border-bottom border-dark border-4">TimeWeaver Team</span>
              </h2>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white border p-4"
            >
              <form onSubmit={handleWhatsApp}>
                <div className="row g-4">
                  <div className="col-md-12 text-start">
                    <label className="fw-bold text-uppercase small tracking-wider mb-2">Your Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg rounded-0 border-dark shadow-none" 
                      placeholder="Enter your full name"
                      required
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                   <div className="col-md-12 text-start">
                    <label className="fw-bold text-uppercase small tracking-wider mb-2">Your Message</label>
                    <textarea 
                      className="form-control form-control-lg rounded-0 border-dark shadow-none" 
                      rows="4" 
                      placeholder="How can we help you?"
                      required
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>

                   <div className="col-md-12 mt-4">
                    <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                      <button 
                        type="submit" 
                        className="btn btn-dark btn-lg px-5 py-3 rounded-0 fw-bold text-uppercase tracking-wider d-flex align-items-center justify-content-center gap-2 hover-scale"
                        style={{ fontSize: '14px' }}
                      >
                        <FaWhatsapp size={18} /> Send on WhatsApp <FaArrowRight size={12} />
                      </button>

                      <a 
                        href="mailto:shraddha.patil5242@gmail.com" 
                        className="btn btn-outline-dark btn-lg px-5 py-3 rounded-0 fw-bold text-uppercase tracking-wider d-flex align-items-center justify-content-center gap-2 hover-scale"
                        style={{ fontSize: '14px' }}
                      >
                        <FaEnvelope size={16} /> Official Mail
                      </a>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </div>

      <style>{`
        .hover-scale {
          transition: all 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
        input:focus, textarea:focus {
          border-width: 2px !important;
        }
      `}</style>
    </section>
  );
};

export default Contact;