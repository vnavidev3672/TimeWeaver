import React from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import "../../Styles/Layout.css";

const Layout = ({ children, title, description, keywords, author }) => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>

      <Header />
      <main className="main-content flex-grow-1 p-1 ">
        <Toaster />
        {children}
      </main>
      <Footer />
    </div>
  );
};


Layout.defaultProps = {
  title: "TimeWeaver | Smart Timetable & Project Manager",
  description:
    "TimeWeaver is an intelligent timetable and project management app designed for schools and institutes to efficiently schedule classes, teachers, and subjects.",
  keywords:
    "TimeWeaver, timetable generator, project management, school scheduling, MERN, education tech, AI timetable",
  author: "Shraddha Patil",
};

export default Layout;
