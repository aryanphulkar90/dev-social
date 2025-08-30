const mongoose = require("mongoose");

const bcrycpt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { Schema, model } = mongoose;

const validator = require("validator");
const { default: isURL } = require("validator/lib/isURL");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    age: {
      type: Number,
      required: true,
      trim: true,
      min: 18,
    },
    emailID: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: (emailID) => {
          return validator.isEmail(emailID);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (password) => {
          return validator.isStrongPassword(password);
        },
        message: (props) => `${props.value} is not a strong password`,
      },
    },
    gender: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      required: true,
      validate: {
        validator: (gender) => {
          return ["male", "female", "others"].includes(gender);
        },
        message: (props) => `${props.value} is not valid gender`,
      },
    },
    photoURL: {
      type: String,
      trim: true,
      validate: {
        validator: (photoURL) => {
          return isURL(photoURL);
        },
        message: (props) => `${props.value} is not valid a URL`,
      },
      default:
        "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
    },
    about: {
      type: String,
      trim: true,
      default: "This is default about data of a user."
    },
    skills: {
      type: Array,
      default: ["Programming"]
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "some string", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.verifyPassword = async function (passwordInputByUser) {
   const user = this;
   const match = await bcrycpt.compare(passwordInputByUser, user.password)
   return match
}

module.exports = model("User", userSchema);
