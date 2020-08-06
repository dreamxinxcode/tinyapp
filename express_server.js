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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userExists = (email) => {
  const keys = Object.keys(users);
  for (let key of keys) {
    console.log(users[key].email);
    if (users[key].email === email) {
      console.log('email already exists');
      return true;
    }
  }
  console.log('email is available');
  return false;
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
    email: req.cookies["email"],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// Create
app.get('/urls/new', (req, res) => {
  const templateVars = {
    email: req.cookies["email"]
  };
  res.render('urls_new', templateVars);
});

// Read
app.get('/urls', (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
    urls: urlDatabase,
    shortURL: req.params.shortURL
  };
  res.render('urls_index', templateVars);
});

// Update
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
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
    email: req.cookies["email"],
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
    email: req.cookies["email"],
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  if (req.body.email && req.body.password) {
    if (userExists(req.body.email) === false) {
      let newUserID = generateRandomString();
      users[newUserID] = {
        id: newUserID,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie('user_id', newUserID);
      res.redirect('/urls');
    } else {
      res.status(400);
      res.send('400 status code');
    }
  } else {
    res.status(400);
    res.send('400 status code');
  }
});

app.post('/login', (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  res.cookie('email', req.body.email);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('email');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});