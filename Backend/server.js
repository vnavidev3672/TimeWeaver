//add a row into table test of mysql database nodedb with express and bootstarp
function main() {
  let express = require("express");
  let app = express();
  let morgan = require("morgan");
  let db_con = require("./config/db.js");
  const cors = require("cors");
  const path = require('path');
  const mongoose = require("mongoose");

  let authRoutes = require('./routes/authRoutes.js')
  let unitRoutes = require('./routes/unitRoutes.js')
  let internalexternalRoutes = require('./routes/internalexternalRoutes.js')
  let academicRoutes = require('./routes/academicRoutes.js')

  db_con();

  let dotenv = require("dotenv");
  dotenv.config();

  let port = process.env.PORT || 3000;

  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

  app.use(express.json());
  app.use(morgan('dev'));

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  app.get("/", (req, res) =>
    res.send(`Welcome to TT`)
  );


  app.use('/auth', authRoutes);
  app.use('/ut', unitRoutes);
  app.use('/ie', internalexternalRoutes);
  app.use('/ac', academicRoutes);


  app.get("*", (req, res) =>
    res.send("Erorr : 404")
  );


  app.listen(port, function () {
    console.log(
      "Server is ready, please open your browser at http://localhost:%s",
      port
    );
  });
}

main();
