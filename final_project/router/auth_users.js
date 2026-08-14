const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({message: "Username and password are required"});
  if (!authenticatedUser(username, password)) return res.status(401).json({message: "Invalid login credentials"});
  const accessToken = jwt.sign({username}, "access", {expiresIn: "1h"});
  req.session.authorization = {accessToken};
  return res.status(200).json({message: "User successfully logged in", accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review || req.body.review;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  if (!review) return res.status(400).json({message: "Review text is required"});
  books[isbn].reviews[req.user.username] = review;
  return res.status(200).json({message: "Review successfully posted/updated", reviews: books[isbn].reviews});
});

// Delete a book review posted by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  if (!(req.user.username in books[isbn].reviews)) return res.status(404).json({message: "Review not found for this user"});
  delete books[isbn].reviews[req.user.username];
  return res.status(200).json({message: "Review successfully deleted", reviews: books[isbn].reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
