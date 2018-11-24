// Need to npm install --save express, mysql, ejs, and body-parser
var express = require('express');
var mysql = require('mysql');
var Parser = require("body-parser");
var app = express();

app.use(Parser.urlencoded({extended: true}));
// Will look for a file in local directory called "views" and for a file with ".ejs" at the end
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // Use public folder to access css

// To give acccess to user quizbase run ALTER USER 'quizbase'@'localhost' IDENTIFIED WITH mysql_native_password BY ''
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'quizbase',
    password: '',
    database: 'quizbase'
});

// Check if server is working properly
connection.connect(function(error) {
    if(error) {
        console.log(error);
    } else {
        console.log("Database connection successful (-:");
    }
});

let signedInUser = { userID: "0", userName: "", loggedIn: false, currentDeckID: 0, userExist: false};
// let userExist = false;

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
    let password = req.body.password;
    console.log(username, password);
    let q = "SELECT userId, username, password FROM user WHERE username = '" + username + "' AND password = '" + password + "'";
    connection.query(q, function(err, results){
      if(err) throw err;
      if(results[0]){
        console.log("The username and password are correct!");
        signedInUser.userID = results[0].userId;
        signedInUser.userName = results[0].username;
        signedInUser.loggedIn = true;
        res.redirect('/dashboard');
      }
      else{
        console.log("The username or password is incorrect. Try again.");
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
    let password = req.body.password;
    console.log(username, password);
    let q = "SELECT username FROM user WHERE username = '" + username + "'";
    connection.query(q, function(err, results){
      if(err) throw err;
      if(results[0]){
        console.log("This username is taken");
        res.redirect('/');
      }else{
        q = "INSERT INTO user(username, password) VALUES ('" + username + "', '" + password + "')";
        connection.query(q, function(err, results){
          if(err) throw err;
          console.log(results);

        });
        q = "SELECT userId, username, password FROM user WHERE username = '" + username + "' AND password = '" + password + "'";
        connection.query(q, function(err, results){
          if(err) throw err;
          if(results[0]){
            console.log("Account Successfully Created!");
            signedInUser.userID = results[0].userId;
            signedInUser.userName = results[0].username;
            signedInUser.loggedIn = true;
            res.redirect('/dashboard');
          }
        });

      }
    });
});
// app.post("/register", function(req, res){
//     let username = req.body.username;
//     let password = req.body.password;
//     console.log(username, password);
//     let q = "SELECT username FROM user WHERE username = '" + username + "'";
//     connection.query(q, function(err, results){
//       if(err) throw err;
//       if(results[0]){
//         signedInUser.userExist = true;
//       }
//       console.log(signedInUser.userExist);
//
//     });
//     console.log(signedInUser.userExist);
//     if(signedInUser.userExist){
//       q = "INSERT INTO user(username, password) VALUES ('" + username + "', '" + password + "')";
//       connection.query(q, function(err, results){
//         if(err) throw err;
//         console.log(results);
//
//       });
//       q = "SELECT userId, username, password FROM user WHERE username = '" + username + "' AND password = '" + password + "'";
//       connection.query(q, function(err, results){
//         if(err) throw err;
//         if(results[0]){
//           console.log("Account Successfully Created!");
//           signedInUser.userID = results[0].userId;
//           signedInUser.userName = results[0].username;
//           signedInUser.loggedIn = true;
//           signedInUser.userExist = false;
//           res.redirect('/dashboard');
//         }
//       });
//     }
//     else{
//       console.log("Account Unsuccessfully Created!");
//       res.redirect('/');
//     }
// });

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

  let q = "SELECT name, topicId, schoolId FROM deck WHERE deckId =" + deckID;
  let r = "SELECT cardId, cardName, description FROM cards WHERE deckId = " + deckID;
  let t = "SELECT * FROM topic";
  let s = "SELECT * FROM school";
  let result = [];
  let topicName =[];
  let schoolName =[];
  connection.query(q, function(err, results){
    if(err) throw err;
    let deckName = results[0].name;
    let topicID = results[0].topicId;
    let schoolID = results[0].schoolId;

    connection.query(r, function(err, results){
      if(err) throw err;
      results.forEach(function(card) {result.push(card);})
      console.log(result);

      connection.query(t, function(err, results){
        if(err) throw err;
        results.forEach(function(topic) {topicName.push(topic);})

        connection.query(s, function(err, results){
          if(err) throw err;
          results.forEach(function(school) {schoolName.push(school);})
          res.render("showDeck", {deckName: deckName, topicID: topicID, schoolID: schoolID, key: result, deckID: deckID, topic: topicName, school: schoolName});
        });

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

app.post("/showDeck/updateSchool", function(req, res){
  let schoolID = req.body.chosenSchool;
  let deckID = req.body.updateSchool;
  let q = "UPDATE deck SET schoolId = " + schoolID + " WHERE deckid = " + deckID;
  connection.query(q, function(err, results){
    if(err) throw err;
  });
  res.redirect("/showDeck");
});

app.get("/displayDecks", function(req, res){
  let topicID = req.query.box;
  if(topicID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT topicName FROM topic WHERE topicId = " + topicID;
    console.log(topicID);
    let d = "SELECT deckId, name FROM deck WHERE topicId = " + topicID;
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
        res.render("displayDecks", {key: result});
      });
    });
  }
});

app.get("/displayCards", function(req, res){
  let deckID = req.query.deck;
  if(deckID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT name, user.username FROM deck JOIN user ON user.userId = deck.userId WHERE deckId =" + deckID;
    let r = "SELECT cardName, description FROM cards WHERE deckId = " + deckID;
    let deckInfo = []
    let result = [];
    connection.query(q, function(err, results){
      if(err) throw err;
      console.log(results);
      results.forEach(function(deck) {deckInfo.push(deck);})
      console.log(deckInfo);

      connection.query(r, function(err, results){
        if(err) throw err;
        results.forEach(function(card) {result.push(card);})
        console.log(result);

        res.render("displayCards", {deckInfo: deckInfo, key: result});
      });
    });
  }

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

app.post("/signout", function(req, res){
  signedInUser.userID = "0";
  signedInUser.userName = "";
  signedInUser.loggedIn = false;
  signedInUser.currentDeckID = 0;
  res.redirect("/");
})

app.get('*', function(req, res) {
    res.redirect('/dashboard');
});

//bottom
app.listen(8080, function() {
    console.log("Server running on 8080");
});
