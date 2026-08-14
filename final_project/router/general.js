const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({message: "Username and password are required"});
  if (isValid(username)) return res.status(409).json({message: "User already exists"});
  users.push({username, password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = decodeURIComponent(req.params.author).toLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.author.toLowerCase() === author));
  return Object.keys(matches).length ? res.status(200).json(matches) : res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = decodeURIComponent(req.params.title).toLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.title.toLowerCase() === title));
  return Object.keys(matches).length ? res.status(200).json(matches) : res.status(404).json({message: "No books found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews) : res.status(404).json({message: "Book not found"});
});

// Async Axios implementations used to demonstrate concurrent, non-blocking access.
const API_URL = process.env.BOOK_API_URL || 'http://localhost:5000';

const getAllBooks = async () => {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
};

const getBookByISBN = (isbn) => axios.get(`${API_URL}/isbn/${isbn}`).then((response) => response.data);

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${API_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`${API_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
