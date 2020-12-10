const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

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

//Finding URLs for a specific user ID
const urlsForUser = (id, obj) => {
  const urlsObject = {};
  for (const key in obj) {
    if (obj[key].userID === id) {
      urlsObject[key] = obj[key];
    }
  }
  return urlsObject;
};

//Object to keep Users
const users = {};

//Object to keep URLs
const urlDatabase = {};

app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// <--------------------------Get Requests Below------------------------->
//Index page for all URLs
app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId || ""],
  };
  res.render("urls_index", templateVars);
});

//Creating new short URLs
app.get("/urls/new", (req, res) => {
  const userId = users[req.cookies["userId"]];
  if (userId) {
    const templateVars = { user: users[req.cookies["userId"]] || "" };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Getting details of a specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["userId"]] || "",
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
  const templateVars = { user: users[req.cookies["userId"]] || "" };
  res.render("registeration_page", templateVars);
});

//Getting Login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["userId"]] || "" };
  res.render("login_page", templateVars);
});
// <--------------------POST Request Below--------------------------->
//Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.cookies["userId"] === urlDatabase[shortURL].userID) {
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
  const userId = req.cookies["userId"];
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
    res.cookie("userId", foundUser.id);
    res.redirect("/urls");
  } else {
    const errorMessage = "Login credentials not valid.";
    res.status(403).end(errorMessage);
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
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.cookies["userId"],
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
      res.cookie("userId", id);
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
