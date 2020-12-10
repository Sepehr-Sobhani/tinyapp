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

module.exports = {
  generateRandomStrings,
  idGenerator,
  getUserByEmail,
  urlsForUser,
};
