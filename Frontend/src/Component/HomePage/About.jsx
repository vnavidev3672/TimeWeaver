import React from 'react';
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="py-5 bg-white position-relative overflow-hidden">
       <div className="position-absolute top-0 start-0 translate-middle bg-secondary opacity-10 rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(100px)' }}></div>

      <div className="container py-lg-5 position-relative">
        <div className="row align-items-center g-5">
          
           <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="col-lg-6"
          >
            <h6 className="fw-bold text-uppercase tracking-widest mb-3 text-secondary">
              The AI Mission
            </h6>
            <h2 className="fw-bold display-5 mb-4 text-dark">
              Precision Scheduling for <br />
              <span className="text-black border-bottom border-dark border-4">BVCOE Kolhapur</span>
            </h2>
            <p className="text-muted lead mb-5" style={{ lineHeight: "1.8" }}>
              Our AI Weaver analyzes faculty expertise, classroom availability, and student load
              to create the most efficient academic environment possible. We reduce manual
              labor and ensure <strong>95% accuracy</strong> in all human scheduling conflicts.
            </p>

             <div className="row g-3">
              {[
                { label: "Faculties", value: "50" },
                { label: "Departments", value: "5" },
                { label: "Students", value: "1k+" },
                { label: "Accuracy", value: "95%" }
              ].map((stat, index) => (
                <div className="col-6 col-md-3" key={index}>
                  <div className="p-3 bg-white border border-dark rounded-0 text-center shadow-sm h-100 transition-card">
                    <h4 className="fw-black mb-1 text-black">{stat.value}</h4>
                    <p className="small text-uppercase mb-0 text-secondary fw-bold" style={{ fontSize: '10px' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

           <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="col-lg-6"
          >
            <div className="position-relative">
               <div className="position-absolute bottom-0 start-0 m-4 p-4 bg-dark text-white rounded-0 shadow-lg d-none d-md-block z-3" style={{ maxWidth: "220px" }}>
                <h6 className="fw-bold mb-1 small text-uppercase">Smart Allocation</h6>
                <p className="extra-small mb-0 opacity-75">AI-driven room management for every department.</p>
              </div>

               <div className="p-2 border border-dark bg-white shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                  className="img-fluid rounded-0"
                  alt="Engineering Students"
                  style={{ minHeight: "450px", objectFit: "cover", filter: "grayscale(20%)" }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900; }
        .extra-small { font-size: 11px; }
        .transition-card {
          transition: all 0.3s ease;
        }
        .transition-card:hover {
          background-color: #000 !important;
          color: #fff !important;
        }
        .transition-card:hover h4, .transition-card:hover p {
          color: #fff !important;
        }
        .hover-scale {
          transition: all 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </section>
  );
};

export default About;