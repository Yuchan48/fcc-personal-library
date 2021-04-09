/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

let expect = require("chai").expect;
let mongoose = require("mongoose");
let mongodb = require("mongodb");

module.exports = function(app) {
  mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  let bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  });

  let Book = mongoose.model("Book", bookSchema);

  app
    .route("/api/books")
    .get(function(req, res) {
      Book.find({}, (err, data) => {
        if (err || !data) {
          res.json("no book exists");
        } else {
          let booksData = data.map(book => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length
            };
          });
          return res.json(booksData);
        }
      });

      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function(req, res) {
      let title = req.body.title;
      if (!title) {
        return res.json("missing required field title");
      }

      let newBook = new Book({
        title: title
      });

      newBook.save((err, savedBook) => {
        if (!err && savedBook) {
          return res.json({
            _id: newBook._id,
            title: newBook.title
          });
        }
      });
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res) {
      Book.deleteMany({}, (err, deleted) => {
        if (!err) {
          return res.json("complete delete successful");
        }
      });

      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      let bookid = req.params.id;

      Book.findById(bookid, (err, book) => {
        if (err || !book) {
          return res.json("no book exists");
        } else {
          return res.json({
            _id: bookid,
            title: book.title,
            comments: book.comments
          });
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        return res.json("missing required field comment");
      }

      Book.findById(bookid, (err, book) => {
        if (err || !book) {
          res.json("no book exists");
        } else {
          book.comments.push(comment);
          book.save((err, savedBook) => {
            if (!err && savedBook) {
              return res.json(savedBook);
            }
          });
        }
      });

      //json res format same as .get
    })

    .delete(function(req, res) {
      let bookid = req.params.id;

      Book.findByIdAndRemove(bookid, (err, deletedBook) => {
        if (err || !deletedBook) {
          return res.json("no book exists");
        } else {
          return res.json("delete successful");
        }
      });
      //if successful response will be 'delete successful'
    });
};
