const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    username: {
      unique: true,
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
    },
    log: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
        },
      }
    ],
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
