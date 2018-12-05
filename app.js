// Need to npm install --save express, mysql, ejs, and body-parser
var express = require('express');
var mysql = require('mysql');
var Parser = require("body-parser");
var app = express();
// var popupS = require('popups');


app.use(Parser.urlencoded({extended: true}));
// Will look for a file in local directory called "views" and for a file with ".ejs" at the end
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // Use public folder to access css

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'yourDataBasePassword',
    password: "Noosa11",
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

let signedInUser = { userID: "0", userName: "", loggedIn: false, currentDeckID: 0, userExist: false, currentClass: 0};
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
    let d = "SELECT classId, userId, deckId, name FROM deck WHERE topicId = " + topicID;
    let result=[];
    connection.query(q, function(err, results){
      if(err) throw err;
      // console.log(results);
      result.push(results[0].topicName);

      connection.query(d, function(err, results){
        if(err) throw err;
        // results.forEach(function(deck) {result.push(deck);}) //deck is object
        for(let i = 0; i < results.length; i++){
          if(results[i].classId){
            continue;
          }
          if(signedInUser.userID === results[i].userId){ //make sures to display decks of cards other than their own
            continue;
          }
          else{
            result.push(results[i]);
          }
        }
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
    let q = "SELECT name, user.userId, user.username FROM deck JOIN user ON user.userId = deck.userId WHERE deckId =" + deckID;
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

app.get("/showClasses", function(req,res){ //coming from the headers | shows the classes you created and the classes you joined
  let userID = signedInUser.userID;
  if(userID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT classId, ownerId, name FROM class WHERE ownerId = " + userID;
    let m = "SELECT userId, class.name, class.classId FROM members JOIN class ON class.classId = members.classId WHERE userId = " + userID;
    result = [];
    let joined = [];
    connection.query(q, function(err, results){
      if(err) throw err;
      console.log("results1", results);
      results.forEach(function(own) {result.push(own);})
      connection.query(m, function(err, results){
        if(err) throw err;
        console.log("results2", results);
        results.forEach(function(partOf) {joined.push(partOf);})
        res.render("showClasses", {own: result, joined: joined});
      });
    });
  }
});

app.get("/classes", function(req, res){ //passes the data needed to display the classes from the entire site except the ones the user is already in
  let topicID = req.query.box;
  if(topicID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT topicName FROM topic WHERE topicId = " + topicID;
    console.log("class topic" , topicID);
    // let c = "SELECT ownerId, class.classId, name, userId FROM class JOIN members ON class.classId = members.classId WHERE topicId = " + topicID;
    let s = "SELECT * FROM members WHERE userId = " + signedInUser.userID;
    let c = "SELECT ownerId, classId, name FROM class WHERE topicId = " + topicID;
    let result=[];
    let seperate = [];
    connection.query(q, function(err, results){
      if(err) throw err;
      result.push(results[0].topicName);
      connection.query(s, function(err, results){
        if(err) throw err;
        results.forEach(function(inClass) {seperate.push(inClass.classId);})
        connection.query(c, function(err, results){
          if(err) throw err;
          console.log("seperate: ", seperate);
          for(let i = 0; i < results.length; i++){
            if((signedInUser.userID === results[i].ownerId) || seperate.includes(results[i].classId)){ //makes sure to only display the classes that you don't own or already in!!! So you get the option to request to join or not
              continue;
            }
            else{
              result.push(results[i]);
            }
          }
          res.render("displayClasses", {key: result});
        });
      });
      // connection.query(c, function(err, results){
      //   if(err) throw err;
      //   for(let i = 0; i < results.length; i++){
      //     if((signedInUser.userID === results[i].ownerId)){ //makes sure to only display the classes that you don't own!!! So you get the option to request to join or not
      //       continue;
      //     }
      //     else{
      //       result.push(results[i]);
      //     }
      //   }
      //   res.render("displayClasses", {key: result});
      // });
    });
  }
});

app.get("/displayClass1", function(req, res){
  let classID;
  if(signedInUser.currentClass !== 0) {
    classID = signedInUser.currentClass;
    signedInUser.currentClass = 0;
  } else {
    classID = req.query.class;
  }
  console.log("classID: ", classID);
  if(classID === undefined && signedInUser.currentClass === 0){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT * FROM class WHERE classId = " + classID;
    let d = "SELECT * FROM deck WHERE classId = " + classID;
    let c = "SELECT * FROM members WHERE classId = " + classID;
    let r = "SELECT * FROM request WHERE classId = " + classID;
    let requested = false;
    let result = [];
    let classMaterial = [];
    let members = [];
    connection.query(q, function(err, results){
      if(err) throw err;
      console.log("classInfo: ", results);
      results.forEach(function(info) {result.push(info);})
      connection.query(d, function(err, results){
        if(err) throw err;
        console.log("key: ", results);
        results.forEach(function(material) {classMaterial.push(material);})
        connection.query(c, function(err, results){
          if(err) throw err;
          console.log("members: ", results);
          // results.forEach(function(mem) {members.push(mem);})
          for(let i = 0; i < results.length; i++){
            members.push(results[i].userId);
          }
          console.log(members);
          connection.query(r, function(err, results){
            if(err) throw err;
            console.log("1request", results);
            for(let i = 0; i < results.length; i++){
              if(signedInUser.userID === results[i].userId){
                requested = true;
              }
            }
            res.render("displayClass", {classInfo: result, key: classMaterial, user: signedInUser.userID, members: members, request: requested});
          });
          // res.render("displayClass", {classInfo: result, key: classMaterial, user: signedInUser.userID, members: members});
        });

      });
    });
  }
});
app.post("/showClasses/leaveClass", function(req, res){
  let classID = req.body.leave;
  console.log(classID);
  if(classID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "DELETE FROM members WHERE classId = " + classID + " AND userId = " + signedInUser.userID;
    connection.query(q, function(err, results){
      if(err) throw err;
      res.redirect("/showClasses");
    });
  }
});

// app.get("/displayClass/displayCards", function(req, res){
//   let deckID = req.query.deck;
//   if(deckID === undefined){
//     res.redirect("/dashboard");
//   }
//   else{
//     let q = "SELECT deck.name AS deckName, class.name AS className, deck.classId FROM class JOIN deck ON class.classId = deck.classId WHERE deckId = " + deckID;
//     let r = "SELECT cardName, description FROM cards WHERE deckId = " + deckID;
//     let deckInfo = [];
//     let result = [];
//     connection.query(q, function(err, results){
//       if(err) throw err;
//       console.log("deckInfo: ", results)
//       results.forEach(function(deck) {deckInfo.push(deck);})
//       connection.query(r, function(err, results){
//         if(err) throw err;
//         results.forEach(function(card) {result.push(card);})
//
//         res.render("class", {deckInfo: deckInfo, key: result});
//       });
//     });
//   }
// });

app.get("/displayClassDeck", function(req,res){
  let deckID = req.query.deck;
  if(deckID === undefined){
    res.redirect("/dashboard");
  }
  else{
    let q = "SELECT deck.name AS deckName, class.name AS className, deck.classId FROM class JOIN deck ON class.classId = deck.classId WHERE deckId = " + deckID;
    let r = "SELECT cardName, description FROM cards WHERE deckId = " + deckID;
    let deckInfo = [];
    let result = [];
    connection.query(q, function(err, results){
      if(err) throw err;
      console.log("deckInfo: ", results)
      results.forEach(function(deck) {deckInfo.push(deck);})
      connection.query(r, function(err, results){
        if(err) throw err;
        results.forEach(function(card) {result.push(card);})

        res.render("displayClassDeck", {deckInfo: deckInfo, key: result});
      });
    });
  }
});

app.post("/request", function(req, res){
  let classID = req.body.request;
  // console.log(req.params);
  signedInUser.currentClass = classID;
  console.log("request");
  console.log("hi");
  console.log("classID: ", classID);
  if(classID === undefined){
    res.redirect("/dashboard");
  }
  else {
    // window.alert("Hello! I am an alert box!!");
    let newDeck = {
      userId: signedInUser.userID,
      classId: classID
    }
    connection.query("INSERT INTO request SET ?", newDeck, function(err, results){
      if(err) throw err;
    });
    res.redirect("/displayClass1");
  }
});

app.post("/removeRequest", function(req, res){
  let classID = req.body.request;
  // console.log(req.params);
  signedInUser.currentClass = classID;
  // console.log("request");
  // console.log("hi");
  // console.log("classID: ", classID);
  if(classID === undefined){
    res.redirect("/dashboard");
  }
  else {
    // window.alert("Hello! I am an alert box!!");
    let q = "DELETE FROM request WHERE classId = " + classID;
    connection.query(q, function(err, results){
      if(err) throw err;
      res.redirect("/displayClass1");
    });
  }
});

app.get("/profile", function(req, res){
  let userID = req.query.creator;
  // let q = "SELECT * FROM deck WHERE userId = " + userID;
  // let r = "SELECT * FROM user WHERE userId = " + userID;
  // let result = [];
  // connection.query(q, function(err, results){
  //   if (err) throw err;
  //   console.log(results);
  //   res.render("profile");
  // });
  let q = "SELECT name, deckId, DATE_FORMAT(creationDate, '%b. %d, %Y') AS CD FROM deck WHERE userId = " + userID;
  // let q = "SELECT * FROM deck WHERE userId = " + userID;
  let result = [];
  let name = "SELECT username FROM user WHERE userId = " + userID;
  let created ="SELECT DATE(creationDate) AS CD FROM deck WHERE userId = " + userID;
  connection.query(q, function(err, results){
    if(err) throw err;
    results.forEach(function(deck) {result.push(deck);});
    connection.query(name, function(err, results){
      if(err) throw err;
      res.render("profile", {name: results[0].username, key: result});
    });
  });
  // res.render("profile");
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
