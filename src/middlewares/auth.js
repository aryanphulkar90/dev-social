const User = require("../models/user");

const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;

    if (!token) {
      const error = new Error("Token Not Valid, Please login again");
      error.status = 401;
      return next(error);
    }

    const decodedMessage = jwt.verify(token, "some string");

    const { _id } = decodedMessage;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User doesnt exist");
    }

    req.user = user;

    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { userAuth };
