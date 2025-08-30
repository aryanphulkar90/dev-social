const mongoose = require("mongoose")

const {Schema, model} = mongoose

const User = require("./user")

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: "{VALUE} is not a supported status",
      },
      required: true
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.pre('save', async function (next) {
  const connectionRequest = this
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("Cannot send connection request to yourself.")
  }  
  next()
})

module.exports = model("ConnectionRequest", connectionRequestSchema)