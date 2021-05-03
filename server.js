require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const connectDB = require("./db.js");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const multer = require("multer");

//Allow CORS
app.use(cors());

const server = http.createServer(app);

const port = process.env.PORT || 5001;
server.listen(port, () => console.log(`server is running on port ${port}`));

//importing Models
const Book = require("./Models/Book");
const Author = require("./Models/Author");
const Reader = require("./Models/Reader");

//Logging
if (process.env.NODE_ENV === "Development") {
  app.use(morgan("dev"));
}

connectDB();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "books");
  },
  filename: function (req, file, cb) {
    const name = req.query.docID + ".pdf";
    console.log(name);
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

//Handling Upload Request
app.post("/uploadbook", upload.single("book"), (req, res, next) => {
  const file = req.file;
  console.log(file);
  // console.log(req);
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

//Handling Get File Request
app.get("/book", (req, res, next) => {
  const name = req.query.docID + ".pdf";
  // res.download(`./books/${name}`);
  res.sendFile(__dirname + `/books/${name}`);
});

//Routes

app.post("/addreader", (req, res) => {
  //  console.log(req);
  console.log(req.body);
  const email = req.body.email;
  console.log(email);
  const newReader = {
    email: req.body.email,
    GID: req.body.GID,
    name: req.body.name,
    MyList: [],
    Continue: [],
  };
  Reader.find({ email }, (err, user) => {
    console.log(err);
    console.log(user);
    console.log(user.length);

    if (user.length > 0) {
      console.log("user : ", user.length);
      res.send("Already Added");
    } else {
      console.log("not");
      Reader.create(newReader)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));

      res.send("success");
    }
  });
});

app.get("/checkauthor", (req, res) => {
  const email = req.query.email;
  Author.find({ email }, (err, user) => {
    console.log(err);
    console.log(user);
    user.length !== 0 ? res.send(user) : res.send(false);
  });
});

app.post("/addauthor", (req, res) => {
  console.log(req.cookies);
  console.log(req.body.name);

  const newAuthor = {
    email: req.body.email,
    GID: req.body.GID,
    Name: req.body.fname + req.body.lname,
    Fname: req.body.fname,
    Lname: req.body.lname,
    Mnumber: req.body.mobile,
    Twitter: req.body.twitter,
    City: req.body.city,
    State: req.body.state,
    Country: req.body.country,
    Company: req.body.company,
    Clocation: req.body.location,
    Bio: req.body.AboutYourself,
    Website: req.body.website,
    picUrl: req.body.imgUrl,
    linkedInUrl: req.body.linkedInUrl,
  };
  console.log(newAuthor);

  Author.find({ email: req.body.email }, (err, user) => {
    console.log(err);
    if (user.length > 0) {
      Author.updateOne(
        { email: req.body.email },
        {
          $set: {
            ...user,
            ...newAuthor,
          },
        }
      )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } else {
      Author.create(newAuthor)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
    res.send("success");
  });
});

app.get("/profile", (req, res) => {
  const email = req.query.email;
  Author.find({ email })
    .populate("books")
    .exec((err, user) => {
      if (err) {
        console.log(err);
      }
      user.length !== 0 ? res.send(user) : res.send(false);
    });
});

app.get("/mylist", (req, res) => {
  const email = req.query.email;
  console.log(email);
  Reader.findOne({ email })
    .populate("MyList")
    .exec((err, user) => {
      if (err) {
        console.log(err);
      }
      if (user) {
        res.send(user.MyList);
      } else {
        res.send("User Not Found");
      }
    });
});

app.get("/cr", async (req, res) => {
  const email = req.query.email;
  console.log(email);

  Reader.findOne({ email })
    .populate("Continue")
    .exec((err, user) => {
      if (err) {
        console.log(err);
      }
      if (user) {
        res.send(user.Continue);
      } else {
        res.send("User Not Found");
      }
    });
});

app.get("/home/genres", (req, res) => {
  const genre = req.query.genre;

  Book.find({ genres: genre, state: "Published" })
    .sort({ date: -1 })
    .populate("author")
    .exec((err, books) => {
      if (err) {
        console.log(err);
      }
      res.send(books);
    });
});

app.get("/search", (req, res) => {
  const name = req.query.name;

  Book.find(
    { state: "Published", $text: { $search: name } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .populate("author")
    .exec((err, books) => {
      if (err) {
        console.log(err);
      }
      res.send(books);
    });
});

app.get("/authorlist", async (req, res) => {
  const name = req.query.name;
  console.log("called");
  console.log(name);

  if (name) {
    const searchKey = new RegExp(name, "i");
    Author.find({ Name: searchKey })
      .limit(7)
      .exec(function (err, results) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        console.log(results);
        res.send(results);
      });
  } else {
    res.send([]);
  }

  // Author.find({ $text: { $search: name } }, { score: { $meta: "textScore" } })
  //   .sort({ score: { $meta: "textScore" } })
  //   .then((list) => {
  //     res.send(list);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});

app.get("/pendingrequest", async (req, res) => {
  Book.find({ state: "Pending" })
    .sort({ date: -1 })
    .populate("author")
    .exec((err, books) => {
      if (err) {
        console.log(err);
      }
      res.send(books);
    });
});

app.get("/checkbook", async (req, res) => {
  const docID = req.query.docID;

  await Book.find({ docID }, (err, info) => {
    if (err) {
      console.log(err);
    }
    console.log(info);
    if (info.length > 0) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

app.get("/bookbyid", async (req, res) => {
  const docID = req.query.docID;

  await Book.findOne({ docID }, (err, info) => {
    if (err) {
      console.log(err);
    }
    res.send(info);
  });
});

app.get("/checkaccess", async (req, res) => {
  const docID = req.query.docID;
  const email = req.query.email;

  Book.find({ docID, editor: email }, (err, books) => {
    if (err) {
      console.log(err);
    }
    if (books.length > 0) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

app.post("/startwriting", async (req, res) => {
  const email = req.query.email;
  console.log(email);
  let bookId;
  let authorId = req.body.authorId;
  var Fname = "";
  var Lname = "";
  if (!authorId) {
    await Author.findOne({ email }, async (err, user) => {
      if (err) console.log(err);
      if (user) {
        authorId = user._id;
        Fname = user.Fname;
        Lname = user.Lname;
        console.log(authorId);

        const newBook = {
          author: { id: authorId, Fname, Lname },
          imageUrl: req.body.imageUrl,
          title: req.body.title,
          description: req.body.description,
          genres: req.body.genres,
          state: "Editing",
          docID: req.body.docID,
          editor: [req.query.email],
        };

        await Book.create(newBook)
          .then((res) => {
            console.log(res);
            bookId = res._id;
          })
          .catch((err) => console.log(err));

        await Book.findOne({ _id: bookId })
          .populate("author")
          .exec((err, book) => {
            if (err) console.log("Error : ", err);
            console.log(book);
          });

        const updatedAuthor = await Author.update(
          { _id: authorId },
          {
            $push: { books: bookId },
          }
        );
        console.log(updatedAuthor);

        res.send("successfully added book");
      } else {
        res.send("Please Complate Your Profile First");
      }
    });
  }
});

app.post("/submit", async (req, res) => {
  let docID = req.query.docID;

  Book.updateOne(
    { docID },
    {
      $set: {
        imageUrl: req.body.imageUrl,
        title: req.body.title,
        description: req.body.description,
        genres: req.body.genres,
        pdfUrl: req.body.pdfurl,
        state: "Pending",
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.post("/publish", async (req, res) => {
  let docID = req.query.docID;

  Book.updateOne(
    { docID },
    {
      $set: {
        state: "Published",
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.post("/reject", async (req, res) => {
  let docID = req.query.docID;

  Book.updateOne(
    { docID },
    {
      $set: {
        state: "Editing",
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.get("/count/unfinished", async (req, res) => {
  const email = req.query.email;
  console.log(email);
  await Author.findOne({ email }, async (err, user) => {
    if (err) console.log(err);
    if (user) {
      console.log(user);
      const authorID = user._id;

      Book.find({
        "author.id": authorID,
        $or: [{ state: "Editing" }, { state: "Pending" }],
      })
        .then((info) => {
          res.send({ count: info.length });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.send("Author Not Found");
    }
  });
});

app.post("/addchapter", async (req, res) => {
  let docID = req.query.docID;

  Book.updateOne(
    { docID },
    {
      $push: {
        chapters: req.body.cname,
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.post("/addeditor", async (req, res) => {
  let docID = req.query.docID;

  Book.updateOne(
    { docID },
    {
      $push: {
        editor: req.body.email,
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.post("/handlelike", async (req, res) => {
  let updatedBook;

  const bookId = req.query._id;
  const authorId = req.body.authorId;
  const liked = req.body.liked;
  console.log(bookId);

  if (liked && authorId) {
    updatedBook = await Book.updateOne(
      { _id: BookId },
      { $push: { "likes.likers": authorId } }
    );
    console.log(updatedBook);
  } else {
    updatedBook = await Book.updateOne(
      { _id: req.query._id },
      { $pull: { "likes.likers": authorId } }
    );
    console.log(updatedBook);
  }

  res.send("success");
});

app.get("/getcomment", async (req, res) => {
  const docID = req.query.docID;

  Book.findOne({ docID })
    .then((book) => {
      console.log(book);
      res.send(book.comments);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/addcomment", async (req, res) => {
  const GID = req.body.GID;
  var id;

  await Reader.findOne({ GID }, (err, user) => {
    id = user._id;
  });

  Book.updateOne(
    { docID: req.body.docID },
    {
      $push: {
        comments: {
          commentBy: id,
          comment: req.body.comment,
          Gname: req.body.Gname,
          GID: req.body.GID,
        },
      },
    }
  )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  res.send("success");
});

app.post("/addtomylist", async (req, res) => {
  const email = req.body.email;
  const docID = req.body.docID;
  console.log(email, docID);
  const book = await Book.findOne({ docID });
  console.log(book);

  Reader.find({ email, MyList: book._id }, (err, reader) => {
    if (reader.length > 0) {
      Reader.updateOne(
        { email },
        {
          $pull: {
            MyList: book._id,
          },
        }
      )
        .then((response) => {
          console.log("removed");
          res.send("removed");
        })
        .catch((err) => {
          console.log(err);
          console.log("added");
        });
    } else {
      Reader.updateOne(
        { email },
        {
          $push: {
            MyList: book._id,
          },
        }
      )
        .then((response) => {
          res.send("added");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

app.post("/addtocr", async (req, res) => {
  const email = req.body.email;
  const docID = req.body.docID;

  const book = await Book.findOne({ docID });

  Reader.find({ email, MyList: book._id }, (err, reader) => {
    if (reader.length > 0) {
      res.send("Already Added to List");
    } else {
      Reader.updateOne(
        { email },
        {
          $push: {
            Continue: book._id,
          },
        }
      )
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});
