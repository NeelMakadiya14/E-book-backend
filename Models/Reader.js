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
  MyList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  Continue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  joined: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reader", readerSchema);
