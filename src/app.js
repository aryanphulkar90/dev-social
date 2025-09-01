const express = require("express");

const cookieParser = require("cookie-parser");

const app = express();

const cors = require("cors");

const whitelist = ["http://98.80.227.209", "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

const connectDB = require("./config/database.js");

const userAuthRouter = require("./routes/userAuth.js");
const profileRouter = require("./routes/profile.js");
const requestsRouter = require("./routes/requests.js");

app.use("/auth", userAuthRouter);
app.use("/profile", profileRouter);
app.use("/request", requestsRouter);

app.use((err,req,res,next)=>{
  return res.status(err.status || 400).json({ error: err.message });
})

connectDB()
  .then(() => {
    console.log("DB Connection Established");
    app.listen(3000, () => {
      console.log("Listening to port 3000 ....");
    });
  })

  .catch(() => {
    console.log("DB Connection Failed");
  });
