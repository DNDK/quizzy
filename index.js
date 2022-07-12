const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

app.use(express.json());
app.use(session({
  secret: "penis",
  cookie: {maxAge: 24*3600*1000},
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(csrf({
  cookie: true
}))

const mongoDB = `mongodb+srv://admin:${process.env.DB_PW}@cluster0.pt4dnfi.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use((err, req, res, next) => {
  if(err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403);
  res.send({"message": "Bad csrf token"});
})

app.use("/api/users", require("./users"));
app.use("/api/quizzes", require("./quizzes"));
app.get("/api/getCsrf", (req, res) => {
  res.send({
    token: req.csrfToken()
  })
});
app.get("/api/getYear", (req, res) => {
  let date = new Date();
  let year = date.getFullYear();

  res.send({
    year
  })
});

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(PORT);
})
