const User = require("../models/user");

const jwt = require("jsonwebtoken");

const userAuth = async(req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;

    if (!token) {
      return res.status(401).send("Token not valid");
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
    res.status(400).send("Error " + err);
  }
};

module.exports = { userAuth };