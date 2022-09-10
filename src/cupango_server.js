//#region MODULES
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const path = require("path");
const passport = require("passport");
//const cookieParser = require("cookie-parser");
var cors = require('cors')

require("dotenv").config();
//#endregion

//require("./helper/passport");

const app = express();

app.use(cors());
//app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

const dbConfig = require("./config/dbConfig");

//#region CONNECTIVITY CHECK
dns.lookup("www.google.com", (err) => {
  if (err) {
    console.log("No Internet");
    process.exit();
  } else {
    console.log("Connected to Internet ");
  }
});
//#endregion

//#region MONGOOSE CONNECTION
mongoose.set("debug", true);
const db = mongoose.connection;
mongoose.connect(dbConfig.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
db.on("error", (e) => {
  console.error("\x1b[31m", new Error(`${e}`));
});
db.once("open", () => {
  console.log(
    "\x1b[32m",
    `Connected to DB : ${process.env.DB_NAME}`,
    "\x1b[0m"
  );
});
db.on("reconnectFailed", () => {
  console.error("\x1b[31m", new Error("Reconnect Failed"), "\x1b[0m");
});
db.on("disconnected", () => {
  console.error("\x1b[31m", new Error("Unable to connect to DB", "\x1b[0m"));
});
//#endregion

//#region LOGGER
app.use((req, res, next) => {
  console.log(req.method, req.url, res.statusCode);
  next();
});
//#endregion

//#region  VIEW ENGINE
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
//#endregion

//#region ROUTES
// const oAuth = require("./routes/oauth.router");
// const index = require("./routes/index.router");
// const user = require("./routes/user.router");
// const admin = require("./routes/admin.router");
// const designer = require("./routes/designer.router");
const api = require("./routes/api.route");
app.use("/api", api);
app.get('/', function (req, res) {
  res.send(`
  <html>
  <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <body style="text-align: center;">
  <b>Savvy, eh? </b><br> Check endpoint. {CUPANGO}
  </body>
  </html>
  `)
})
// app.use("/oauth", oAuth);
// app.use("/designer", designer);
// app.use("/admin", admin);
// app.use("/user", user);
//app.use("/", index);
//#endregion

//#region  PORT CONFIGURATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//#endregion
