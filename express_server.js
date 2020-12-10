//App configurations
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

//Importing Helper functions
const {
  idGenerator,
  generateRandomStrings,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");

//Object to keep Users URLs
const users = {};
const urlDatabase = {};

app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// <--------------------------Get Requests Below------------------------->
//Index page for all URLs
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId || ""],
  };
  res.render("urls_index", templateVars);
});

//Creating new short URLs
app.get("/urls/new", (req, res) => {
  const userId = users[req.session.userId];
  if (userId) {
    const templateVars = { user: users[req.session.userId] || "" };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Getting details of a specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.userId] || "",
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    const errorMessage = "This short URL does not exist.";
    res.status(404).end(errorMessage);
  }
});

//Registeration route (GET)
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userId] || "" };
  res.render("registeration_page", templateVars);
});

//Getting Login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userId] || "" };
  res.render("login_page", templateVars);
});
// <--------------------POST Request Below--------------------------->
//Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to delete the link.";
    res.status(401).end(errorMessage);
  }
});

//Updating a URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.userId;
  if (userId === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL]["longURL"] = req.body.updatedURL;
    urlDatabase[shortURL]["userID"] = userId;
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to edit the link.";
    res.status(401).end(errorMessage);
  }
});

//login with the email
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(userEmail, users);
  if (foundUser && bcrypt.compareSync(password, foundUser["hashedPassword"])) {
    req.session.userId = foundUser.id;
    res.redirect("/urls");
  } else {
    const errorMessage = "Login credentials not valid.";
    res.status(403).end(errorMessage);
  }
});

//logout button route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Sending data with form to create a new short URL
app.post("/urls", (req, res) => {
  const randomString = generateRandomStrings(6);
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.userId,
  };
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = idGenerator();
  if (email && hashedPassword) {
    if (!getUserByEmail(email, users)) {
      users[id] = { id, email, hashedPassword };
      req.session.userId = id;
      res.redirect("urls");
    } else {
      const errorMessage = "This email address is already registered.";
      res.status(400).end(errorMessage);
    }
  } else {
    const errorMessage =
      "Empty email or password. Please make sure you fill out both fields.";
    res.status(400).end(errorMessage);
  }
});

// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
