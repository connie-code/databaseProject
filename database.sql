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
  password VARCHAR(255) NOT NULL
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


INSERT INTO user(username, password)
VALUES ("Connie", "people123"),
  ("Friend", "people123"),
  ("Cindy", "people123"),
  ("John", "people123");

INSERT INTO school(schoolName, location)
VALUES ("City College", "Manhattan"),
  ("Hunter", "Manhattan"),
  ("College of Staten Island", "Staten Island"),
  ("Brooklyn College", "Brooklyn"),
  ("John Jay", "Manhattan"),
  ("BMCC", "Manhattan"),
  ("Wagner College", "Staten Island"),
  ("Baruch College", "Manhattan"),
  ("York College", "Queens"),
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
VALUES ("Linear Algebra 346", 1, 1, CURDATE(), 2),
  ("Biology", 2, 2, DATE '2017-12-17', 1),
  ("Mozart", 2, 7, DATE '2018-08-29', 1),
  ("Chemistry", 3, 2, DATE '2016-12-17', 2),
  ("Algortihms", 1, 3, DATE '2017-05-15', 1),
  ("Shading", 1, 5, DATE '2017-12-01', 1),
  ("Literacy Techniques", 3, 4, DATE '2017-01-17', 2),
  ("American Revolution", 1, 6, DATE '2018-01-17', 1),
  ("Constitution", 1, 6, DATE '2018-05-17', 3),
  ("Data Structures", 3, 3, DATE '2018-8-30', 3),
  ("Set Theory Lecture", 4, 3, DATE '2018-09-29', 1),
  ("Halloween", 4, 6, DATE '2018-10-31', 1);

INSERT INTO cards(deckId, cardName, description)
VALUES (1, "Matrix", "asdfghjkl"),
  (1, "Eigen Value", "asdfghjkl"),
  (1, "Identity Matrix", "asdfghjkl"),
  (3, "Who is he?", "Austrian Composer"),
  (3, "When was he born?", "January 27, 1756"),
  (3, "How many children did he have?", "6 Children"),
  (3, "What is his full name?", "Wolfgang Amadeus Mozart"),
  (4, "What is chemistry", "The scientific displine involved with compoundscomposed of atoms"),
  (4, "What is an atom?", "The smallest component of an element"),
  (4, "Molecule is ____?", "the smallest particle in a chemical element"),
  (4, "Examples of molecules", "carbon dioxide, glucose, sucrose"),
  (5, "QuickSort", "QuickSort is a Divide and Conquer algorithm"),
  (5, "What is algorithm in computer science?", "An algorithm is a well-defined procedure that allows a computer to solve a problem"),
  (5, "Time Complexity", "The time complexity is the computational complexity that describes the amount of time it takes to run an algorithm"),
  (6, "Shading Art", "makes all the difference between an amateur drawing and a piece of art"),
  (6, "4 Types of Shading", "smooth, cross, hatching, slinky"),
  (7, "Literacy Techniques", "Allusion, Diction, Euphemism"),
  (8, "George Washington", "He led the Patriot forces to victory over the Briish and their allies"),
  (9, "What is the Constitution?", "A set of basic laws or principles for a country that describe the rights and duties of its citizens");

INSERT INTO cards(deckId, cardName, description)
VALUES (10, "Queue", "asdfghjkl"),
  (10, "Stack", "asdfghjkl"),
  (10, "Binary Tree", "asdfghjkl"),
  (11, "What is a set", "A set is a collection of elements"),
  (11, "Cardinality", "For a countable set A, the cardinality of A is the size of A"),
  (12, "When is Halloween?", "The night of October 31th"),
  (12, "What is Halloween also known as?", "The eve of All Saints' Day"),
  (12, "How is Halloween celebrated but children?", "Celebrated by children who dress in costume and solcit candy or other treats door-to-door");

INSERT INTO cards(deckId, cardName, description)
VALUES (2, "Chromosomes", "asdfghjkl"),
  (2, "Cell", "asdfghjkl"),
  (2, "Mitochondria", "asdfghjkl");
