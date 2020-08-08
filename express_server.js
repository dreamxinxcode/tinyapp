const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const app = express();
const PORT = 8080;


// set the view engine to ejs
app.set('view engine', 'ejs');


// Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['something-secure'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({
  extended: true
}));


const users = {};


const urlDatabase = {};


const urlsForUser = (id) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};


const generateRandomString = () => {
  let string = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    string += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return string;
};


app.get('/', (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user, urls: urlDatabase};

  // If user is logged in
  if (user) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }

});


app.get('/urls/new', (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const templateVars = {user};

  // If user is logged in
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }

});


app.get('/urls', (req, res) => {
  // Expect userID in the session
  const userID = req.session.userID;
  const user = users[userID];

  // If user is not logged in
  if (!user) {
    res.status(403);
    res.send('You must be logged in to view this page');
    return;
  }

  const urls = urlsForUser(userID);
  const templateVars = {user, urls};
  res.render('urls_index', templateVars);
});


app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  const userID = req.session.userID;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const urls = urlsForUser(userID);
  const templateVars = {user, urls, longURL, shortURL};

  // If user is not logged in
  if (!user) {
    res.status(403);
    res.send('You must be logged in to perfom this action');
    return;
  }

  // User must be logger in - create URL
  urlDatabase[shortURL] = {longURL, userID};
  res.render('urls_show', templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const shortURL = req.params.shortURL;

  // If user is not logged in
  if (!user) {
    res.status(403);
    res.send('You must be logged in first');
    return;
  }

  // If user owns URL
  if (id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }
  res.status(403);
  res.send('You do not have permission to delete this URL');
  return;

});


app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const shortURL = req.params.shortURL;

  // If user is not logged in
  if (!user) {
    res.status(403);
    res.send('You must be logged in to view this page');
    return;
  }

  // If URL does not exist
  if (!urlDatabase[shortURL]) {
    res.status(404);
    res.send('Link does not exist');
    return;
  }
  
  // If requested shortURL does exist
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    user,
    shortURL,
    longURL
  };

  // If user does not own the URL
  if (user.id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('You do not have permission to edit this URL');
    return;
  }
  res.render("urls_show", templateVars);
  return;
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.userID;
  const owner = urlDatabase[shortURL].userID;

  // If user owns URL
  if (id === owner) {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
    return;
  }

  res.status(403);
  res.send('You do not have permission to edit this URL');
  return;
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  // If shortURL does not exist
  if (!urlDatabase[shortURL]) {
    res.status(404);
    res.send('Please enter a valid URL');
    return;
  }

  // If shortURL does exist
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = {user};
  
  // If user is logged in
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('register', templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // If email and password are empty
  if (!email && !password) {
    res.status(400);
    res.send('400 status code');
    return;
  }

  const user = helpers.getUserByEmail(email, users);

  if (user) {
    res.status(400);
    res.send('User already exists');
    return;
  }

  let id = generateRandomString();
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  req.session.userID = id;
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const templateVars = {user};

  // If user is already logged in
  if (user) {
    res.redirect('/urls');
    return;
  }

  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = helpers.getUserByEmail(email, users);

  // If provided email is not in the DB
  if (!user) {
    res.status(403);
    res.send('Email does not exist');
    return;
  }

  // Hash and compare passwords - if not valid, show message
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403);
    res.send('Email and password do not match');
    return;
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  req.session = null; // Delete cookie - end session
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


module.exports = users;