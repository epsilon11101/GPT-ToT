require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.accessLogStream = fs.createWriteStream(
      path.join(__dirname, "../logs/access.log"),
      { flags: "a" }
    );
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(morgan("tiny", { stream: this.accessLogStream }));
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }
  routes() {
    this.app.use("/chatgpt", require("../routes/chatgpt.routes"));
  }
  listen() {
    this.app.listen(this.port);
  }
}

module.exports = Server;
