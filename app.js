// Need to npm install --save express, mysql, ejs, and body-parser
var express = require('express');
var mysql = require('mysql');
var Parser = require("body-parser");
var app = express();

app.use(Parser.urlencoded({extended: true}));
// Will look for a file in local directory called "views" and for a file with ".ejs" at the end
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // Use public folder to access css

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Noosa11',
    database: 'quizbase'
});

// Check if server is working properly
connection.connect(function(error) {
    if(!!error) {
        console.log("Error connecting to database");
    } else {
        console.log("Connected");
    }
});

let signedInUser = { userID: "0", userName: "", loggedIn: false, currentDeckID: 0};

app.get("/", function(req,res){
  if(signedInUser.loggedIn){
    res.redirect('/dashboard');
  }
  else{
    res.render("homepage"); //the homepage of the ejs
  }
});

app.get("/signin", function(req, res){
  if(signedInUser.loggedIn){
    res.redirect('/dashboard');
  }
  else{
    res.render("signin"); //the homepage of the ejs
  }
  // res.render("signin");
});

app.post("/login", function(req, res){
    let username = req.body.username;
    let email = req.body.email;
    console.log(username, email);
    let q = "SELECT userId, username, email FROM user WHERE username = '" + username + "' AND email = '" + email + "'";
    connection.query(q, function(err, results){
      if(err) throw err;
      if(results[0]){
        console.log("The username and email are correct!");
        signedInUser.userID = results[0].userId;
        signedInUser.userName = results[0].username;
        signedInUser.loggedIn = true;
        res.redirect('/dashboard');
      }
      else{
        console.log("The username or email is incorrect. Try again.");
        res.redirect('/signin');
      }
    });
});

// app.get("/login", function(req, res){
//   let username = req.query.username;
//   let email = req.query.email;
//   let q = "SELECT username, email FROM user WHERE username =" + username + " AND email = " + email;
//   console.log(q, username, email);
//   connection.query(q, function(err, results){
//     if(err) throw err;
//     if(results.username){
//       res.redirect("/dashboard");
//     }
//   });
// });

// app.get("/homepage", function(req, res){
//   res.render("homepage");
// });

app.post("/register", function(req, res){
    let username = req.body.username;
    let email = req.body.email;
    console.log(username, email);
    let q = "INSERT INTO user(username, email) VALUES ('" + username + "', '" + email + "')";
    connection.query(q, function(err, results){
      if(err) throw err;
      console.log(results[0]);
      // res.redirect("/dashboard");
    });
    q = "SELECT userId, username, email FROM user WHERE username = '" + username + "' AND email = '" + email + "'";
    connection.query(q, function(err, results){
      if(err) throw err;
      if(results[0]){
        console.log("Account Successfully Created!");
        signedInUser.userID = results[0].userId;
        signedInUser.userName = results[0].username;
        signedInUser.loggedIn = true;
        res.redirect('/dashboard');
      }
      else{
        console.log("Account Unsuccessfully Created!");
        res.redirect('/');
      }
    });
});

app.get("/dashboard", function(req, res){
  // console.log(signedInUser.userID);
  if(signedInUser.loggedIn){
    let result = [];
    let q = "SELECT * FROM deck WHERE userId = " + signedInUser.userID;
    connection.query(q, function(err, results){
      if(err) throw err;
      // console.log(results);
        // res.render("dashboard", {key: results});
        results.forEach(function(deck) {result.push(deck);})
        // console.log(result[0].name);
        res.render("dashboard", {key: result});
    });
  }
  else{
    res.redirect("/");
  }
});
//***************************
app.post("/createDeck", function(req, res){
  let userID = signedInUser.userID;
  // let q = "INSERT INTO deck (name, userId) VALUES ('Untitled', "+ userID + ")";
  let newDeck = {
    name: "Untitled",
    userID: userID
  }
  connection.query("INSERT INTO deck SET ?", newDeck, function(err, results){
    if(err) throw err;
  });
  res.redirect("/dashboard");
});

app.get("/showDeck", function(req, res){ //to edit the deck selected from dashboard
  let deckID = req.query.edit;
  if(deckID===undefined){
    deckID = signedInUser.currentDeckID;
  }
  else{
    signedInUser.currentDeckID = deckID;
  }

  let q = "SELECT name, topicId FROM deck WHERE deckId =" + deckID;
  let r = "SELECT cardId, cardName, description FROM cards WHERE deckId = " + deckID;
  let t = "SELECT * FROM topic";
  let result = [];
  let topicName =[];
  connection.query(q, function(err, results){
    if(err) throw err;
    result.push(results[0].name);
    result.push(results[0].topicId);

    connection.query(r, function(err, results){
      if(err) throw err;
      results.forEach(function(card) {result.push(card);})
      console.log(result);

      connection.query(t, function(err, results){
        if(err) throw err;
        results.forEach(function(topic) {topicName.push(topic);})
        res.render("showDeck", {key: result, deckID: deckID, topic: topicName});
      });
      // res.render("showDeck", {key: result, deckID: deckID});
    });
  });
});

app.post("/showDeck/editName", function(req, res){
  let newName = req.body.deckName;
  let deckID = req.body.edit;
  // signedInUser.currentDeckID = deckID;
  console.log(newName, deckID);
  let q = "UPDATE deck SET name = '" + newName +"' WHERE deckId = " + deckID;
  connection.query(q, function(err, results){
    if(err) throw err;
    console.log(results);
    // res.redirect();
  });
  res.redirect("/showDeck");
});

app.post("/showDeck/updateCard", function(req, res){
  let newCardName = req.body.cardName;
  let newCardDescription = req.body.cardDescription;
  let cardID = req.body.cardId;
  let q = "UPDATE cards SET cardName = '" + newCardName +"' WHERE cardId = " + cardID;
  connection.query(q, function(err, results){
    if(err) throw err;
    console.log(results);
  });
  q = "UPDATE cards SET description = '" + newCardDescription +"' WHERE cardId = " + cardID;
  connection.query(q, function(err, results){
    if(err) throw err;
    console.log(results);
  });
  res.redirect("/showDeck");
});

app.post("/showDeck/deleteCard", function(req, res){
  let cardID = req.body.delete;
  let q = "DELETE FROM cards WHERE cardId = " + cardID;
  connection.query(q, function(err, results){
    if(err) throw err;
  });
  res.redirect("/showDeck");
});

app.post("/showDeck/addCard", function(req, res){
  let deckID = signedInUser.currentDeckID;
  console.log(deckID);
  // let q = "SELECT cardId FROM cards ORDER BY cardId DESC LIMIT 1";
  let q = "INSERT INTO cards(deckId, cardName, description) VALUES (" + deckID + ", 'Card Name Here', 'Description Here')";
  console.log(q);
  connection.query(q, function(err, results){
    if(err) throw err;
    // res.render("addCard", {key: result, deckID: deckID});
    console.log(results);
    res.redirect("/showDeck");
  });
});

app.post("/showDeck/updateTopic", function(req, res){
  let topicID = req.body.chosenTopic;
  let deckID = req.body.updateTopic;
  let q = "UPDATE deck SET topicId = " + topicID + " WHERE deckid = " + deckID;
  connection.query(q, function(err, results){
    if(err) throw err;
  });
  res.redirect("/showDeck");
});

app.get("/displayDecks", function(req, res){
  let topicID = req.query.box;
  let q = "SELECT topicName FROM topic WHERE topicId = " + topicID;
  console.log(topicID);
  let d = "SELECT deckId, name FROM deck WHERE topicId = " + topicID;
  // let result = {topicKey: topic};
  let result=[];
  connection.query(q, function(err, results){
    if(err) throw err;
    // console.log(results);
    result.push(results[0].topicName);

    connection.query(d, function(err, results){
      if(err) throw err;
      results.forEach(function(deck) {result.push(deck);}) //deck is object
      // results.forEach(deck => {result.push(deck);})
      console.log(result);
      // result.push(results[0].name);
      // console.log(results[0].name);
      res.render("displayDecks", {key: result, name: "Connie"});
    });
  });
  // let test = {key: result, name: "Connie"};
  // res.render("displayDecks", {key: result, name: "Connie"});
});

app.get("/displayCards", function(req, res){
  let deckID = req.query.deck;
  let q = "SELECT name FROM deck WHERE deckId =" + deckID;
  let r = "SELECT cardName, description FROM cards WHERE deckId = " + deckID;

  let result = [];
  connection.query(q, function(err, results){
    if(err) throw err;
    result.push(results[0].name);

    connection.query(r, function(err, results){
      if(err) throw err;
      results.forEach(function(card) {result.push(card);})
      console.log(result);

      res.render("displayCards", {key: result});
    });
  });
});

app.post("/dashboard/deleteDeck", function(req, res){
  let deckID = req.body.delete;
  let q = "DELETE FROM cards WHERE deckId = " + deckID;
  connection.query(q, function(err, results){
    if(err) throw err;
  });
  q = "DELETE FROM deck where deckId = " + deckID;
  connection.query(q, function(err, results){
    if(err) throw err;
  });
  res.redirect("/dashboard");
});


// app.post("/register", function(req, res){
//   let username = req.query.username;
//   let email = req.query.email;
//   let q = "INSERT INTO user(username, email) VALUES (" + username + "," + email + ")";
//
//   connection.query(q, function(err, results){
//     // if(err) throw err;
//     res.redirect("/dashboard");
//   });
// });


app.get('*', function(req, res) {
    res.redirect('/dashboard');
});

//bottom
app.listen(8080, function() {
    console.log("Server running on 8080");
});
