import React from "react";
import "../../Styles/LoadingForm.css";

const LoadingForm = () => {
  return (
    <div className="loading-form-container">
      <div className="skeleton-card">
        <div className="skeleton-title mb-4"></div>

        <div className="skeleton-input mb-3"></div>
        <div className="skeleton-input mb-3"></div>
        <div className="skeleton-input mb-3"></div>
        <div className="skeleton-input mb-3"></div>
        <div className="skeleton-input mb-3"></div>

        <div className="skeleton-button-wrapper">
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingForm;
