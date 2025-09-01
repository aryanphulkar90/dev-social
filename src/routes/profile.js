const express = require("express");

const profileRouter = express.Router();

const bcrypt = require("bcrypt");

const { userAuth } = require("../middlewares/auth.js");

const { validateProfileEditRequest } = require("../utils/validation.js")

const validator = require("validator");

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;    
    res.json({
      message: `Here is ${user.firstName}'s profile`,
      data: user
    });
  } catch (err) {
    next(err)
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    validateProfileEditRequest(req)

    const user = req.user;
    
    const reqFields = Object.keys(req.body)

    reqFields.map((field) => {
      console.log(field)
      user[field] = req.body[field];
    });

    await user.save();

    res.json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(400).send("Error " + err);
  }
});

profileRouter.patch("/changePassword", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const { oldPasswordInput, newPasswordInput } = req.body;

    if (!validator.isStrongPassword(newPasswordInput)) {
      throw new Error("Password is not Strong");
    }

    const isOldPasswordInputCorrect = await user.verifyPassword(
      oldPasswordInput
    );

    if (!isOldPasswordInputCorrect) {
      throw new Error("Incorrect Old Password");
    }

    const newHashedPassword = await bcrypt.hash(newPasswordInput, 10);

    user.password = newHashedPassword;

    await user.save();

    res.send("Password changed Successfully");
  } catch (err) {
    res.send("Error " + err);
  }
});

module.exports = profileRouter;
