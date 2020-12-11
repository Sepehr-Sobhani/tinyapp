const { assert, use } = require("chai");
const { getUserByEmail, urlsForUser } = require("../helpers");

// getUserByEmail Tests
const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedOutput);
  });
  it("should return undefined if an email does not exist in the database", () => {
    const user = getUserByEmail("s.s@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

//urlsForUser Test
const urlsDatabase = {
  a2f9: {
    longURL: "http://www.google.com",
    userID: "bob",
  },
  f5tg: {
    longURL: "http://www.bbc.com",
    userID: "shaun",
  },
  bc65: {
    longURL: "http://www.github.com",
    userID: "bob",
  },
  h6d3: {
    longURL: "http://www.yahoo.com",
    userID: "peter",
  },
  j7nd: { longURL: "http://www.example.com", userID: "bob" },
};

describe("urlsForUser", () => {
  it("should return corresponding urls for a given user id", () => {
    const userURLs = urlsForUser("bob", urlsDatabase);
    const expectedOutput = {
      a2f9: {
        longURL: "http://www.google.com",
        userID: "bob",
      },
      bc65: {
        longURL: "http://www.github.com",
        userID: "bob",
      },
      j7nd: { longURL: "http://www.example.com", userID: "bob" },
    };
    assert.deepEqual(userURLs, expectedOutput);
  });

  it("should return an empty object if no urls found for a specific user", () => {
    const userURLs = urlsForUser("Jimmy", urlsDatabase);
    const expectedOutput = {};
    assert.deepEqual(userURLs, expectedOutput);
  });
});
