const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  author: {
    // required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pdfUrl : {
    type: String,
  },
  imageUrl: String,
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    default: Date.now,
  },
  genres: {
    type: [String],
  },
  state : String,
  comments: {
    type: [
      {
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: { type: Date, default: Date.now },
        comment: String,
        Gname: String,
        GID: String,
      },
    ],
  },
  likes: {
    count: Number,
    likers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
});

module.exports = mongoose.model("Post", bookSchema);