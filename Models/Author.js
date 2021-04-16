const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  GID: {
    type: String,
    required: true,
    trim: true,
  },
  Name: String,
  Fname: String,
  Lname: String,
  Mnumber: Number,
  Twitter: String,
  City: String,
  State: String,
  Country: String,
  Company: String,
  Clocation: String,
  Bio: String,
  Website: String,
  picUrl: String,
  linkedInUrl: String,
  joined: {
    type: Date,
    default: Date.now,
  },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

module.exports = mongoose.model("Author", authorSchema);
