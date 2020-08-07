const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {};

const getUserByEmail = (email) => {
  const keys = Object.keys(users);
  for (let key of keys) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
};

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
    user: users[req.session.userID],
    urls: urlDatabase,
  };
  if (templateVars.user) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Create
app.get('/urls/new', (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const templateVars = {user};
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Read
app.get('/urls', (req, res) => {
  // Expect userID in the session
  const user = users[req.session.userID];
  const userID = req.session.userID;
  if (!user) {
    res.send('You must be logged in to view this page');
    return;
  }
  const urls = urlsForUser(userID);
  const templateVars = {user, urls};
  res.render('urls_index', templateVars);
});

// Update
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {user, shortURL, longURL};
  if (!user) {
    res.send('You must be logged in to view this page');
    return;
  }
  // If requested shortURL exists
  if (urlDatabase[shortURL]) {
    res.render("urls_show", templateVars);
    return;
  } else {
    res.send('Please enter a valid URL');
    return;
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
    urls: urlDatabase,
  };
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  const userID = req.session.userID;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const urls = urlsForUser(userID);
  const templateVars = {user, urls, longURL, shortURL};
  if (!user) {
    res.send('You must be logged in to perfom this action');
    return;
  }
  urlDatabase[shortURL] = {longURL, userID};
  res.render('urls_show', templateVars);
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    return;
  } else {
    res.send('You do not have permission to delete this URL');
    return;
  }
});

// Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    res.send('Please enter a valid URL');
    return;
  }
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const templateVars = {user};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email && !password) {
    res.status(400);
    res.send('400 status code');
    return;
  }
  const user = getUserByEmail(email);
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
  const templateVars = {
    user: users[id],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

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
  // If 
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