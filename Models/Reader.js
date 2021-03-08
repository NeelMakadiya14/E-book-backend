const mongoose = require("mongoose");

const readerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
  email: {
    type: String,
    required: true,
  },
  GID: {
    type: String,
    required: true,
    trim: true,
  },
  joined: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reader", readerSchema);