const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    Fname: String,
    Lname: String,
  },
  editor: {
    type: [String],
  },
  chapters: {
    type: [String],
  },
  docID: {
    type: String,
    required: true,
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
  state: String,
  comments: {
    type: [
      {
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reader",
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
        ref: "Reader",
      },
    ],
  },
});

module.exports = mongoose.model("Book", bookSchema);
