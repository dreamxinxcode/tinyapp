const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');
// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  let str = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

// Homepage
app.get('/', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// Create
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

// Read
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    shortURL: req.params.shortURL
  };
  res.render('urls_index', templateVars);
});

// Update
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log(req.body);
  urlDatabase[shortURL] = longURL;
  console.log(shortURL, longURL);
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    longURL: req.body.longURL,
    shortURL: key
  };
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.render('urls_show', templateVars);
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.cookie('username', req.body.username);
  console.log(req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  console.log(res.cookie)
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});