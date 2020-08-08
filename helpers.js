const expressServer = require('./express_server');


const getUserByEmail = (email, database) => {
  const keys = Object.keys(database);
  for (let key of keys) {
    const user = database[key];
    if (user.email === email) {
      return key;
    }
  }
};


module.exports = {
  getUserByEmail
};