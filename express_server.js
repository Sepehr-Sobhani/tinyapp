const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//Read all URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Sending data with form to create a new short URL
app.post("/urls", (req, res) => {
  const randomString = generateRandomStrings(6);
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/u/${randomString}`);
});

//Creating new short URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Getting details of a specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

//Redirecting to the long URL
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Deleting a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
