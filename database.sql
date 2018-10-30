DROP DATABASE quizbase;
CREATE DATABASE quizbase;

USE quizbase;

-- creating user
CREATE TABLE school(
  schoolId INT AUTO_INCREMENT PRIMARY KEY,
  schoolName VARCHAR(255),
  location VARCHAR(500)
);

CREATE TABLE topic(
  topicId INT AUTO_INCREMENT PRIMARY KEY,
  topicName VARCHAR(255) NOT NULL
);

CREATE TABLE user(
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE
  -- schoolId INT,
  -- FOREIGN KEY(schoolId) REFERENCES school(schoolId)
);

CREATE TABLE deck(
  deckId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  userId INT,
  topicId INT DEFAULT 8,
  creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  schoolId INT,
  foreign key(userId) references user(userId),
  foreign key(topicId) references topic(topicId),
  foreign key(schoolId) references school(schoolId)
);

CREATE TABLE profile(
  userId INT,
  deckId INT,
  FOREIGN KEY(userId) REFERENCES user(userId),
  FOREIGN KEY(deckId) REFERENCES deck(deckId)
);

CREATE TABLE cards(
  cardId INT PRIMARY KEY AUTO_INCREMENT,
  deckId INT NOT NULL,
  cardName VARCHAR(255),
  description VARCHAR(2000),
  FOREIGN KEY(deckId) REFERENCES deck(deckId)
);

CREATE TABLE class(
  classId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  topicId INT,
  description VARCHAR(600),
  foreign key(topicId) references topic(topicId)
);

CREATE TABLE members(
  userId INT,
  classId INT,
  foreign key(userId) references user(userId),
  foreign key(classId) references class(classId)
);


INSERT INTO user(username, email)
VALUES ("Connie", "connie@gmail.com"),
  ("Friend", "Friend@gmail.com"),
  ("Cindy", "Cindy@gmail.com");

INSERT INTO school(schoolName, location)
VALUES ("City College", "Manhattan"),
  ("Hunter", "Manhattan"),
  ("College of Staten Island", "Staten Island"),
  ("Brooklyn College", "Brooklyn"),
  ("Select the school", "NULL");


INSERT INTO topic(topicName)
VALUES ("Math"),
  ("Science"),
  ("Computer Science"),
  ("English"),
  ("Art"),
  ("History"),
  ("Music"),
  ("Select your topic");


INSERT INTO deck(name, userId, topicId, creationDate, schoolId)
VALUES ("Linear Algebra", 1, 1, CURDATE(), 2),
  ("Biology", 2, 2, DATE '2017-12-17', 1),
  ("Mozart", 2, 7, DATE '2018-08-29', 1),
  ("Chemistry", 3, 2, DATE '2016-12-17', 2),
  ("Algortihms", 1, 3, DATE '2017-05-15', 1),
  ("Shading", 1, 5, DATE '2017-12-01', 1),
  ("Literacy Techniques", 3, 4, DATE '2017-01-17', 2),
  ("American Revolution", 1, 6, DATE '2018-01-17', 1),
  ("Constitution", 1, 6, DATE '2018-05-17', 3),
  ("Data Structures", 3, 3, DATE '2018-8-30', 3);

INSERT INTO cards(deckId, cardName, description)
VALUES (1, "Matrix", "asdfghjkl"),
  (1, "Eigen Value", "asdfghjkl"),
  (1, "Identity Matrix", "asdfghjkl");

INSERT INTO cards(deckId, cardName, description)
VALUES (3, "Queue", "asdfghjkl"),
  (3, "Stack", "asdfghjkl"),
  (3, "Binary Tree", "asdfghjkl");

INSERT INTO cards(deckId, cardName, description)
VALUES (2, "Chromosomes", "asdfghjkl"),
  (2, "Cell", "asdfghjkl"),
  (2, "Mitochondria", "asdfghjkl");

INSERT INTO class(name, topicId, description)
VALUES ("CSc 336", 3, "asdfghjkl"),
  ("Physics 1", 2, "asdfghjkl"),
  ("Biology", 2, "asdfghjkl");

INSERT INTO members(userId, classId)
VALUES (1, 1),
  (2, 3),
  (3, 2);
