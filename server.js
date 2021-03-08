require("dotenv").config();
const path=require('path');
const express = require("express");
const app = express();
const http = require('http')
const cors = require('cors')
const connectDB = require("./db.js");
const morgan = require("morgan");
const bodyParser = require("body-parser");

//Allow CORS
app.use(cors());


const server = http.createServer(app);

const port=process.env.PORT || 5000;
server.listen(port, () => console.log(`server is running on port ${port}`));

//importing Models
const Book = require('./models/Book');
const Author = require('./models/Author');
const Reader = require('./models/Reader');


//Logging
if (process.env.NODE_ENV === "Development") {
  app.use(morgan("dev"));
}

connectDB();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());





//Routes

app.post('/addreader', (req, res) => {
  console.log(req.cookies);
  console.log(req.body.name);
  const newReader = {
    email: req.body.email,
    GID: req.body.GID,
    name: req.body.name,
  };
  Reader.find({ GID: req.body.GID }, (err, user) => {
    console.log(err);
    user.length !== 0 ? res.send('Already Added') : null;
  });

  Reader.create(newReader)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  res.send('success');
});

app.get('/checkauthor', (req, res) => {
  const email = req.query.email;
  Author.find({ email }, (err, user) => {
    console.log(err);
    console.log(user);
    user.length !== 0 ? res.send(user) : res.send(false);
  });
});

app.post('/addauthor', (req, res) => {
  console.log(req.cookies);
  console.log(req.body.name);
  const newAuthor = {
    email: req.body.email,
    GID: req.body.GID,
    Fname: req.body.Fname,
    Lname: req.body.Lname,
    Mnumber : req.body.Mnumber,
    Twitter : req.body.Twitter,
    City : req.body.City,
    State : req.body.State,
    Country : req.body.Country,
    Company : req.body.Company,
    Clocation : req.body.Clocation,
    Bio : req.body.Bio,
    Website : req.body.Website,
    picUrl: req.body.picUrl,
    linkedInUrl: req.body.linkedInUrl,
  };
  Author.find({ GID: req.body.GID }, (err, user) => {
    console.log(err);
    user.length !== 0 ? res.send('Profile Already Complated') : null;
  });

  Author.create(newAuthor)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  res.send('success');
});

app.get('/profile', (req, res) => {
  const email = req.query.email;
  Author.find({ email })
    .populate('books')
    .exec((err, user) => {
      if (err) {
        console.log(err);
      }
      user.length !== 0 ? res.send(user) : res.send(false);
    });
});


app.get('/home', (req, res) => {
  const genre = req.query.genre;

  Book.find(genre ? { genres: genre } : {})
    .sort({ date: -1 })
    .populate('author')
    .exec((err, books) => {
      if (err) {
        console.log(err);
      }
      res.send(books);
    });
});

app.post('/addbook', async (req, res) => {
  const email = req.query.email;

  let bookId;
  let authorId = req.body.authorId;
  if (!authorId) {
    await Author.findOne({ email }, (err, user) => {
      if (err) console.log(err);
      authorId = user._id;
      console.log(authorId);
    });
  }

  const newBook = {
    author: authorId,
    imageUrl: req.body.imageUrl,
    title: req.body.title,
    description: req.body.description,
    genres: req.body.genres,
    comments: req.body.comments,
    state: req.body.state,
    pdfurl: req.body.pdfurl,
    likes: { count: req.body.likesCount },
  };

  await Book.create(newBook)
    .then((res) => {
      console.log(res);
      bookId = res._id;
    })
    .catch((err) => console.log(err));

  await Book.findOne({ _id: bookId })
    .populate('author')
    .exec((err, book) => {
      if (err) return handleError(err);
      console.log(book);
    });

  const updatedAuthor = await Author.update(
    { _id: authorId },
    {
      $push: { bookss: bookId },
    }
  );
  console.log(updatedUser);

  res.send('successfully added post');
});




