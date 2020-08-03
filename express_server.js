const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');
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

app.get('/', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  const templateVars = {
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});