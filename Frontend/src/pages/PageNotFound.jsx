import React from "react";
import { Link } from "react-router-dom";
import Layout from "../Component/Layout/Layout";

const Pagenotfound = () => {
  return (
    <Layout>
      <div className="pnf">
      <h1 className="pnf-title">404</h1>
      <h2 className="pnf-heading">Oops ! Page Not Found</h2>
      <Link to="/" className="pnf-btn">
        Go Back
      </Link>

      <style>
        {`
          .pnf {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f8f9fa;
            text-align: center;
            padding: 20px;
          }

          .pnf-title {
            font-size: 8rem;
            font-weight: bold;
            color: #dc3545;
            margin: 0;
          }

          .pnf-heading {
            font-size: 2rem;
            margin: 20px 0;
            color: #343a40;
          }

          .pnf-btn {
            display: inline-block;
            padding: 12px 25px;
            font-size: 1rem;
            color: #fff;
            background-color: #007bff;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.3s ease;
          }

          .pnf-btn:hover {
            background-color: #0056b3;
          }
        `}
      </style>
    </div>
    </Layout>
  );
};

export default Pagenotfound;
