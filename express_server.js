const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//Short URL generator
const generateRandomStrings = (stringLength) => {
  let randomString = "";
  let characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < stringLength; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomString;
};

//Id generator for new Users
const idGenerator = () => {
  return "_" + Math.random().toString(36).substring(2, 8);
};

//Finding a user by email
const getUserByEmail = (email, obj) => {
  for (const user in obj) {
    if (obj[user].email === email) {
      return obj[user];
    }
  }
  return undefined;
};

//Object to keep Users
const users = {};

//Object to keep URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// <--------------------------Get Requests Below------------------------->
//Index page for all URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["userId"]],
  };
  res.render("urls_index", templateVars);
});

//Creating new short URLs
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["userId"]] };
  res.render("urls_new", templateVars);
});

//Getting details of a specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["userId"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  if (!urlDatabase[req.params.shortURL]) {
    const errorMessage = "This short URL does not exist.";
    res.status(404).end(errorMessage);
  } else {
    res.render("urls_show", templateVars);
  }
});

//Redirecting to the long URL
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    const errorMessage = "This short URL does not exist.";
    res.status(404).end(errorMessage);
  }
});

//Registeration route (GET)
app.get("/register", (req, res) => {
  res.render("registeration_page");
});

// <--------------------POST Request Below--------------------------->
//Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Updating a URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect("/urls");
});

//login with the username
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const user = getUserByEmail(userEmail, users);

  if (user) {
    res.redirect("/urls");
  } else {
    const errorMessage = "Login credentials not valid.";
    res.status(401).end(errorMessage);
  }
});

//logout button route
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});

//Sending data with form to create a new short URL
app.post("/urls", (req, res) => {
  const randomString = generateRandomStrings(6);
  urlDatabase[randomString] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = idGenerator();
  if (email && password) {
    if (!getUserByEmail(email, users)) {
      users[id] = { id, email, password };
      res.cookie("userId", id);
      res.redirect("urls");
    } else {
      const errorMessage = "This email address is already registered.";
      res.status(400).end(errorMessage);
    }
  } else {
    const errorMessage =
      "Empty username or password. Please make sure you fill out both fields.";
    res.status(400).end(errorMessage);
  }
});

// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
