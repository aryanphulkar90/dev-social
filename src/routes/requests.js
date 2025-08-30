const express = require("express");

const requestsRouter = express.Router();

const { userAuth } = require("../middlewares/auth.js");

const User = require("../models/user");

const ConnectionRequest = require("../models/connectionRequest.js");

const allowedDataToSend = [
  "firstName",
  "lastName",
  "age",
  "photoURL",
  "gender",
  "about"
];

requestsRouter.post(
  "/send/:status/:userID",
  userAuth,
  async (req, res) => {
    try {
      const status = req.params.status;

      const toUserId = req.params.userID;

      const fromUser = req.user;

      const fromUserId = fromUser._id;

      const toUser = await User.findById(toUserId);

      if (!toUser) {
        throw new Error("User you want to send request doesn't exist");
      }

      const request = await ConnectionRequest.findOne({
        $or: [
          { toUserId, fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });

      if (request) {
        throw new Error("Connection request already exists");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();

      res.json({
        "message": "Connection Request Sent Successfully"
      });
    } catch (err) {
      res.status(400).send("Error " + err);
    }
  }
);

requestsRouter.post(
  "/review/:status/:requestID",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestID } = req.params;

      const toUserId = req.user._id;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Status not accepted");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestID,
        toUserId,
        status: "interested",
      });

      if (!connectionRequest) {
        throw new Error("Connection Request is not Present");
      }

      connectionRequest.status = status;

      connectionRequest.save();

      res.send("Connection Request Reviewed");
    } catch (err) {
      res.status(400).send("Error " + err);
    }
  }
);

requestsRouter.get("/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionsReceived = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "age", "gender", "about", "photoURL"]);
    res.json({
      message: "These are connection requests",
      requests: connectionsReceived,
    });
  } catch (err) {
    res.status(400).send("Error " + err);
  }
});

requestsRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", allowedDataToSend)
      .populate("toUserId", allowedDataToSend)
      .lean();

    const data = connections.map((connection) => {
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.json({
      "message": "These are your connections",
      "connections": data
    });
  } catch (err) {
    res.status(400).send("Error " + err);
  }
});

requestsRouter.get("/feed", userAuth, async(req,res)=>{
  try{
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10
    limit = Math.min(limit,10)
    let skip = (page-1)*limit
    const loggedInUser = req.user
    const previousInteractions = await ConnectionRequest.find({
      $or:[{
        toUserId: loggedInUser._id
      },
      {
        fromUserId: loggedInUser._id
      }]
    }).select("fromUserId toUserId").lean()
    const hideUsersfromFeed = new Set()
    previousInteractions.forEach((connection)=>{
      hideUsersfromFeed.add(connection.fromUserId)
      hideUsersfromFeed.add(connection.toUserId)
    })
    const feedUsers = await User.find({
       $and:[
      {_id : { $nin : Array.from(hideUsersfromFeed)}},
      {_id : { $ne : loggedInUser._id}}
       ]
    }).select(allowedDataToSend).skip(skip).limit(limit).lean()
    res.send(feedUsers)
  }
  catch(err){
    console.log(err)
    res.status(400).send("Error" + err.message)
  }
})

module.exports = requestsRouter;
