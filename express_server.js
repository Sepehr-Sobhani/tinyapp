//App configurations
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

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
app.use(methodOverride("_method"));

// <--------------------------Get Requests Below------------------------->
//Root route
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});
//Index page for all URLs
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId || ""],
  };
  if (!userId) {
    const errorMessage = "You need to login";
    res
      .status(401)
      .render("error_page", { user: users[userId] || "", errorMessage });
  }
  res.render("urls_index", templateVars);
});

//Creating new short URLs
app.get("/urls/new", (req, res) => {
  const userId = users[req.session.userId];
  if (req.session.userId) {
    const templateVars = { user: users[req.session.userId] || "" };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Getting details of a specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (!urlDatabase[shortURL]) {
    const errorMessage = "This URL does not exist.";
    res.status(404).render("error_page", { user: users[userID], errorMessage });
  } else if (!userID || !userURLs[shortURL]) {
    const errorMessage = "You are not authorized to see this URL";
    res.status(401).render("error_page", { user: users[userID], errorMessage });
  } else {
    const templateVars = {
      shortURL,
      user: users[userID] || "",
      longURL: urlDatabase[shortURL].longURL || "",
    };
    res.render("urls_show", templateVars);
  }
});

//Redirecting to the long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL].visited++;
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    const errorMessage = "This URL does not exist.";
    res
      .status(404)
      .render("error_page", { user: users[req.session.userId], errorMessage });
  }
});

//Getting registeration form
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session.userId] || "" };
  res.render("registeration_page", templateVars);
});

//Getting Login page
app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session.userId] || "" };
  res.render("login_page", templateVars);
});
// <--------------------POST Request Below--------------------------->
//Deleting an existing URL
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  if (userID && userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to delete the link.";
    res.status(401).render("error_page", { user: users[userID], errorMessage });
  }
});

//Updating a URL
app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  if (userID && userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL]["longURL"] = req.body.updatedURL;
    urlDatabase[shortURL]["userID"] = userID;
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to edit the link.";
    res.status(401).render("error_page", { user: users[userID], errorMessage });
  }
});

//Login user with the email
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(userEmail, users);
  if (foundUser && bcrypt.compareSync(password, foundUser["hashedPassword"])) {
    req.session.userId = foundUser.id;
    res.redirect("/urls");
  } else {
    const errorMessage = "Login credentials not valid.";
    res
      .status(403)
      .render("error_page", { user: users[req.session.userId], errorMessage });
  }
});

//Logout button route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Sending data with form to create a new short URL
app.post("/urls", (req, res) => {
  if (req.session.userId) {
    const randomString = generateRandomStrings(6);
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session.userId,
      createdDate: new Date().toLocaleDateString("en-US"),
      visited: 0,
    };
    res.redirect(`/urls/${randomString}`);
  } else {
    const errorMessage = "Only authorized users can create short URLs";
    res
      .status(401)
      .render("error_page", { user: users[req.session.userId], errorMessage });
  }
});

//Registering new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const id = idGenerator();
  if (email && hashedPassword) {
    if (!getUserByEmail(email, users)) {
      users[id] = { id, email, hashedPassword };
      req.session.userId = id;
      res.redirect("/urls");
    } else {
      const errorMessage = "This email address is already registered.";
      res.status(400).render("error_page", {
        user: users[req.session.userId],
        errorMessage,
      });
    }
  } else {
    const errorMessage =
      "Empty email or password. Please make sure you fill out both fields.";
    res
      .status(400)
      .render("error_page", { user: users[req.session.userId], errorMessage });
  }
});

// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
