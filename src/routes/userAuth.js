const express = require("express");

const userAuthRouter = express.Router();

const bcrypt = require("bcrypt");

const validator = require("validator");

const User = require("../models/user");

userAuthRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      emailID,
      password,
      gender,
      photoURL,
      about,
    } = req.body;

    if (!validator.isStrongPassword(password)) {
      throw new Error("Password is not Strong");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      age,
      emailID,
      password: passwordHash,
      gender,
    });

    if (lastName) user.lastName = lastName;

    if (photoURL) user.photoURL = photoURL;

    if (about) user.about = about;

    await user.save();
    
    const token = await user.getJWT();

    res.cookie("token", token);

    res.json({
      message: "User has been registered Successfully Registered.",
      user: user
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

userAuthRouter.post("/login", async (req, res) => {
  try {
    const { emailID, password } = req.body;

    const user = await User.findOne({ emailID });

    if (user) {
      const match = await user.verifyPassword(password);

      if (match) {
        const token = await user.getJWT();

        res.cookie("token", token);

        res.json({
          message: `Welcome ${user.firstName}`,
          data: user,
        });
      } else {
        throw new Error("Invalid Credentials");
      }
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

userAuthRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("Logged out");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userAuthRouter;
