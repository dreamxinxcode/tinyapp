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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ""},
  "9sm5xK": { longURL: "http://www.google.com", userID: ""}
};

const getUserByEmail = (email) => {
  const keys = Object.keys(users);
  for (let key of keys) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
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
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// Create
app.get('/urls/new', (req, res) => {
  const templateVars = {
    email: req.cookies["email"]
  };
  if (users[req.cookies.user_id]) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Read
app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
    shortURL: req.params.shortURL
  };
  res.render('urls_index', templateVars);
});

// Update
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
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
    user: users[req.cookies.user_id],
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
    user: users[req.cookies.user_id],
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls', templateVars);
});

// Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  const url = urlDatabase[req.params.shortURL].longURL;
  res.redirect(url);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
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
    password
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403);
    res.send('Email does not exist');
    return;
  } else if (user.password !== password) {
    res.status(403);
    res.send('Email and password do not match');
    return;
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});