/*
Name: Jack Stevens
Course CS 337
Purpuse: This is a the JavaScript for 
the Server of the Oastta. This is where 
the connection between the Mongodb is
created and where the get and post 
request are sent to.
*/
const mongoose = require('mongoose');
const express = require('express')
const app = require('express')();
const http = require('http');
const socket = require('socket.io');
const path = require('path');
const cookieParser = require("cookie-parser")
const { disconnect } = require('process');



var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var io = socket.listen(server);

app.use(cookieParser())
//app.use('/app/*', authenticate);
app.use(express.static(path.join(__dirname,'html_css_files')))
var tables = []; 
const suits = ['hearts', 'diams', 'clubs', 'spades'];
const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];





//app.use(parser.urlencoded({ extended: true }));
app.use(express.json())
//const upload = multer({ dest: __dirname + '/public_html/app' });

const connection_string = 'mongodb://127.0.0.1:27017/blackjack';


mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});
// // creates Schema for items 
// var CardSchema = new mongoose.Schema({
//   Suit: String,
//   Name: String,
//   Value: Number,
//   Player: String,
//   PlaceInDeck: Number
// });
// var Card = mongoose.model('Card', CardSchema);


// creates Schema for 
var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  balance: Number,
  roundsPlayed: Number,
  Wins: Number,
  Losses: Number,
  Ties: Number,
  CurrentHand: [Object],
  Total: Number
});
var User = mongoose.model('User', UserSchema);

var DeckSchema = new mongoose.Schema({
  Game: String,
  Cards: [Number]
});
var Deck = mongoose.model('Deck', DeckSchema);

var ourDealer = new User({
  username: "Dealer",
  password: "Dealer",
  balance: 0,
  roundsPlayed: 0,
  Wins: 0,
  Losses: 0,
  Ties: 0,
  Total: 0
});

ourDealer.save();


io.on("connection", (socket)=> 
{
  console.log("User Connected")
  socket.on('login',data => {
    console.log("YES")
    let p1 = User.find({ username: data.u, password: data.p })
    currentUser = req.body.username;
    p1.then((doc) => {
      if (doc.length > 0) {
        let id = addSession(u)
        res.cookie('login', { username: u, sid: id }, { maxAge: 300000000 });
  
        io.to(socket.id).emit("loginResponse", "LOGIN");
      } else {
        io.to(socket.id).emit("loginResponse","Login Failed")
      }
    });
  });
  
  socket.on('joinTable', ({username, tableId,bidamt, type})=>
  {
    console.log("User Connect: "+socket.id)
    const user = userJoin(socket.id, tableId, username ,bidamt, type)
    socket.join(user.tableId)
    console.log(username," Joined Room:", user.tableId)

    io.to(user.tableid).emit("roomUser",
    {
      tableId:user.tableId,
      user:getRoomUsers(user.tableId)
    });

  function draw_card(tableIndex){
    var card; 
    if(!tables[tableIndex]){
      console.log("TABLE NOT FOUND")
    }
    if (tables[tableIndex]){
      var randomNumber = Math.floor(Math.random() * tables[tableIndex].deck.length)
      card = tables[tableIndex].deck.splice(randomNumber, 1)[0];
    }
    
    return card;
  }

  socket.on("hit", function(){
    let tableIndex = tables.findIndex(table.tableId)
    if (tableIndex == -1){
      return console.log("NOT FOUND")
    }
    var card = draw_card(tablesindex)
    if(card){
      socket.emit('make-card', {"suit": card.suit, "rank": cand.rank})
    if(card.rank == "king" || card.rank == "queen" || card.rank == "jack"){
      tables[tableindex].users[tables[tablesIndex].index].total += 10;
    } else if(card.rank == "Ace"){
      if(tables[tablesindex].user[tables[tablesIndex].index].total < 11){
        tables[tablesindex].user[tables[tablesIndex].index].total += 11
      }else{
        tables[tablesindex].user[tables[tablesIndex].index].total += 1
      }
    }else{
      tables[tablesIndex].user[tables[tablesIndex].index].total += card.rank
    }
    socket.emit(score, tables[tableIndex].users[tables[tableIndex].index].total += card.rank)
  }else{
    socket.emit("empty-deck")
  }
  })
})


socket.on('stand-button', function() {
  let tablesindex=tables.findIndex(room=>room.tableid===tableid);
  if(tablesindex===-1){return console.log("Room not found on stand");}
  io.to(tableid).emit('chat message new',"<b>"+tables[tablesindex].users[tables[tablesindex].index].name+" has a score of "+tables[tablesindex].users[tables[tablesindex].index].total+"</b>");
  //last User show New Game
  if (tables[tablesindex].users[tables[tablesindex].index+1] === undefined) 
  {
    io.to(tablesindex).emit('user-turn',false);
    //result start
    let win={name:'dealer',socket:0};
    let max=0;
    for(var i = 0; i < tables[tablesindex].users.length; i++) 
    {
      if (tables[tablesindex].users[i].total <= 21 && (tables[tablesindex].users[i].total > tables[tablesindex].dealer.total || tables[tablesindex].dealer.total>21)) 
      {
        if(tables[tablesindex].users[i].total>max)
        {
          max=tables[tablesindex].users[i].total;
          win=tables[tablesindex].users[i];
        }
      }
    }
      io.to(tableid).emit('winner', win.name);

      //Show Individual Profit/Loss;
      let sum=0;
      let winnerIndex;
  for(let i in tables[tablesindex].users)
  {
    sum+=parseInt(tables[tablesindex].users[i].bet);
    if(tables[tablesindex].users[i]===win)
      winnerIndex=i;
    else
    {
      io.to(tableid).emit('yourBet',
      {
        user:tables[tablesindex].users[i],
        bet:parseInt(tables[tablesindex].users[i].bet)*(-1)
      })
    }
  }

  if(winnerIndex)
  {
    io.to(tableid).emit('yourBet',
    {
      user:tables[tablesindex].users[winnerIndex],
      bet:sum
    });
  }
  else
  {
    io.to(tableid).emit('dealer-won',sum);
  }

    io.to(tableid).emit('show-dealer-hand');
    io.to(tableid).emit('gameOver');
    //result end
  }
  else 
  {
    tables[tablesindex].users[tables[tablesindex].index].turn=false;
    io.to(tables[tablesindex].users[tables[tablesindex].index].socket).emit('user-turn', false);
    tables[tablesindex].index++;
    tables[tablesindex].users[tables[tablesindex].index].turn = true;
    io.to(tables[tablesindex].users[tables[tablesindex].index].socket).emit('user-turn', true);
  }
});
      
//Start Game
socket.on('startGame',({username,tableid,type})=>
{
  tables.push(
    {
      tableid:tableid,
      users:[],
      dealer:{'total':0},
      index:0,
      deck:[]
    });
  
  let tablesindex=tables.findIndex(room=>room.tableid===tableid);     
  if(tablesindex===-1)console.log("Room not found in Game started"); 

  let roomusers=getRoomUsers(tableid);
  for(let data of roomusers)
  {
    tables[tablesindex].users.push({
    'name': data.username,
    'password': data.tableid,
    'socket': data.id,
    'total': 0,
    'turn': false,
    'bet':data.bidamt
    });
  }
  console.log(tables[tablesindex]);


  io.to(tableid).emit('user-turn',false);
  
  io.to(tables[tablesindex].users[0].socket).emit('user-turn',true);


  make_deck();
  function make_deck() {
  tables[tablesindex].deck = [];

  for( var i = 0; i < suits.length; i++ ) {
    
    for( var j = 0; j < ranks.length; j++ ) {
      
      var card = {};
      card.suit = suits[i];
      card.rank = ranks[j];
      tables[tablesindex].deck.push(card);
    }
  }
  }


  io.to(tableid).emit('hide-dealer-hand');
  io.to(tableid).emit('list-of-users', tables[tablesindex].users)
  io.to(tableid).emit("gameStarted");



  socket.on('deal-dealer', function() 
  {
    if (tables[tablesindex].dealer.total < 17) {
      var card = draw_card(tablesindex);
      if(card) {
        io.to(tableid).emit('make-dealer-card',{'suit': card.suit, 'rank': card.rank});
        if(card.rank == "king" || card.rank == "queen" || card.rank == "jack"){
          tables[tableindex].users[tables[tablesIndex].index].total += 10;
        } else if(card.rank == "Ace"){
          if(tables[tablesindex].user[tables[tablesIndex].index].total < 11){
            tables[tablesindex].user[tables[tablesIndex].index].total += 11
          }else{
            tables[tablesindex].user[tables[tablesIndex].index].total += 1
          }
        }else{
          tables[tablesIndex].user[tables[tablesIndex].index].total += card.rank
        }
      io.to(tableid).emit('d_score', tables[tablesindex].dealer.total);
      io.to(tableid).emit('hide-dealer-hand');
      }
    };
  });
//Broadcast when a user disconnects
//   socket.on('disconnect',()=>
//   {
//       const user= userLeaves(socket.id);
      
//       if(user)
//       {
//       //io.to(user.tableid).emit('message',formatMessage(chatBot,`${user.username} left the chat`));
//       io.to(user.tableid).emit('roomUsers',
//       {
//           tableid:user.tableid,
//           users:getRoomUsers(user.tableid)
//       });
//       }
//   })
// })
// //Broadcast when a user disconnects
// socket.on('disconnect',()=>
// {
//   console.log('User Disconnected');
//   const user= userLeaves(socket.id);
  
//   if(user)
//   {
//     io.to(user.tableid).emit('roomUsers',
//     {
//         tableid:user.tableid,
//         users:getRoomUsers(user.tableid)
//     });
//   }
  
})
 })



// function loadcards(currentUser, res) {
//   let p = Card.find({}).deleteMany().exec().then((result) => {
//     console.log(result)
//     const lineReader = require('line-reader');
//     count = 0;
//     lineReader.eachLine('./cards.txt', function (line, last) {
//       if (line[0] != '#') {
//         var params = line.split(',');
//         //console.log(params)
//         var newCard = new Card({
//           Suit: params[0],
//           Name: params[1],
//           Value: Number(params[3]),
//           Player: "In Deck",
//           PlaceInDeck: Number(params[4])
//         });

//         newCard.save().then(() => {
//           count++;
//         })

//       }
//       if (last) {
//         Card.find({}).exec().then((cards) => {
//           //console.log(cards)
//         })
//         // makeDeck(currentUser, res)
//         deal(currentUser, res)
//         deal("Dealer", res)
//       }
//     });
//   })
// }

// function makeDeck() {
//   tmpArr = []
//   for (let z = 0; z < 52; z++) {
//     tmpArr.$push(z)
//   }
// }



// function makeDeck(curUser, res) {
//   Deck.find({ Game: curUser }).deleteMany().exec().then(() => {
//     Card.find({ Game: curUser }).exec().then((results) => {
//       var deck = new Deck({
//         Game: curUser
//       })
//       deck.save().then(() => {
//         for (var c in results) {
//           Deck.updateOne(
//             { Game: curUser },
//             { $push: { Cards: results[c] } }
//           ).then(() => {
//             // Deck.find({ Game: curUser }).exec().then((deckRes) => {
//             //   if (deckRes[0].Cards.length == 52) {
//             //     return;
//             //   }
             
//             //   deal(curUser, res)
//             //   // deal("Dealer", res)
//             // })
//           })
//         }
//         return;
//         //return deck;
//       }).then(() => {
//         Deck.find({ Game: curUser }).exec().then((deckRes) => {
//           if (deckRes[0].Cards.length == 52) {
//             deal(curUser, res)
//             deal("Dealer", res)
//             return;
//           }
         
          
//           // deal("Dealer", res)
//         })
//       })
//     })
//   })

// }


//add current session
sessions = {}
function addSession(user) {
  var sessionId = Math.floor(Math.random() * 100000);
  var sessionStart = Date.now();
  sessions[user] = { 'sid': sessionId, 'start': sessionStart };
  return sessionId;
}

//checks to see if user has active session
function doesUserHaveSession(user, sessionId) {
  let entry = sessions[user]
  if (entry != undefined) {
    return entry.sid === sessionId
  }
  return false;
}

// cleans up session once they reach a certain age
const SESSION_LENGTH = 6000000

function cleanupSeasons() {
  let CurrentTime = Date.now()
  for (i in sessions) {
    let sess = sessions[i];
    if (sess.start + SESSION_LENGTH < CurrentTime) {
      console.log('removing session for user: ' + i)
      delete sessions[i]
    } else {
      console.log('keeping session for user: ' + i)
    }
  }
}

setInterval(cleanupSeasons, 6000000)

// It will redirected the page back to the login 
// if no cookie is found.
function authenticate(req, res, next) {
  let c = req.cookies;

  if (c && c.login) {

    let results = doesUserHaveSession(c.login.username, c.login.sid);
    if (results) {
      next();
      return;
    }
  }
  res.redirect('/index.html');
}




// // (GET) Changes the id status from SALE to SOlD
// // Pushes the item id to purchase list of the user.
// hands = {}
// app.get('/start/deal/', (req, res) => {

//   var currentUser = req.cookies.login.username;
//   loadcards(currentUser, res)
//   resetDeck()
//   // deal(currentUser, res)
//   // deal("Dealer", res)

//   // bool = true;
//   // while (bool) {
//   //   User.find({username: currentUser}).exec().then((userRes) => {
//   //     User.find({username: "Dealer"}).exec().then((dealerRes) => {
//   //       if (userRes[0].CurrentHand.length == 2 && dealerRes[0].CurrentHand.length == 2) {
//   //         bool = false;
//   //         res.end();
//   //       }
//   //       else {
//   //         bool = true;
//   //       }
//   //     })
//   //   })
//   // }

//   // Card.find({ Player: "In Deck" }).exec().then((cards) => {
//   //   if (cards.length == 52) {
//   //     deal(currentUser)
//   //     return;
//   //   }
//   // }).then(() => {
//   //   Card.find({ Player: "In Deck" }).exec().then((cards) => {
//   //     if (cards.length == 50) {
//   //       deal("Dealer")
//   //       return;
//   //     }
//   //   }).then(() => {
//   //     res.end();
//   //   })
//   // })

// })


// function resetDeck() {
//   p1 = Card.updateMany({ Player: { $regex: `^(?!.*In Deck)` } },
//     { $set: { Player: "In Deck" } })
//   User.updateMany(
//     { CurrentHand: { $not: { $size: 0 } } },
//     {
//       $set: { CurrentHand: [] }
//     }).then(() => {
//       return;
//     })
//     .catch((err) => {
//       console.log(err)
//     })
// }


// function deal(currentUser, res) {
//   console.log('dealing ' + currentUser)
//   User.updateOne(
//     { username: currentUser },
//     { $set: { Total: 0 } })
//     .then(() => {
//       for (let i = 0; i <= 1; i++) {
//         p1 = Card.find({ Player: "In Deck" }).exec();
//         p1.then((results) => {
//           //console.log(results.length);
//           var randomNumber = Math.floor(Math.random() * results.length);
//           var card = { "Suit": results[randomNumber].Suit, "Value": results[randomNumber].Value, "Name": results[randomNumber].Name }
//           Card.updateOne(
//             { _id: String(results[randomNumber]._id) },
//             { $set: { Player: currentUser } }).then((cardRes) => {
//               //console.log(cardRes);
//               User.updateOne(
//                 { username: currentUser },
//                 {
//                   $push: { CurrentHand: card },
//                   $inc: { Total: results[randomNumber].Value }
//                 })

//                 .then((userRes) => {
//                   //console.log(userRes)
//                   console.log(card);
//                   User.find({ username: currentUser }).exec().then((userRes) => {
//                     User.find({ username: "Dealer" }).exec().then((dealerRes) => {
//                       if (userRes[0].CurrentHand.length == 2 && dealerRes[0].CurrentHand.length == 2) {
//                         // console.log('returning from deal for ' + currentUser)
//                         console.log('all cards have been dealt, returning to client')
//                         // Card.find({Player: "In Deck"}).exec().then((resultsa) => {console.log(resultsa); console.log(resultsa.length)});
//                         res.end();
//                       }
//                     })
//                   })
//                   //console.log(results[randomNumber].Value)
//                 })
//             })
//             .catch((error) => {
//               console.log(error);
//             });
//         })
//       }
//     })
// }



// app.get('/get/hand/', (req, res) => {
//   res.end(JSON.stringify(hand))

// })


// //(POST) Should add a user to the database. The username and
// // password should be sent as POST parameter(s).

// app.get('/hit/card/', (req, res) => {
//   let currentUser = req.cookies.login.username
//   p0 = User.find({ username: currentUser }).exec().then((results) => {
//     // temp = results[0];
//     // h = temp.CurrentHand;
//     // total = 0;
//     // for (var x in h) {
//     //   v = h[x];
//     //   total += v.Value;
//     // }
//     // return total;
//     return results[0];

//   }).then((us) => {

//     console.log(us.Total);
//     if (us.Total > 21) {
//       res.end();
//     }
//     return us.CurrentHand.length;
//   }).then((oldLength) => {
//     p1 = Card.find({ Player: "In Deck" }).exec();
//     p1.then((results) => {
//       var randomNumber = Math.floor(Math.random() * results.length);
//       console.log("dealing");
//       var card = { "Suit": results[randomNumber].Suit, "Value": results[randomNumber].Value, "Name": results[randomNumber].Name }
//       Card.updateOne(
//         { _id: String(results[randomNumber]._id) },
//         { $set: { Player: currentUser } }).then(() => {


//           User.updateOne(
//             { username: currentUser },
//             {
//               $push: { CurrentHand: card },
//               $inc: { Total: results[randomNumber].Value }
//             }).then(() => {
//               User.find({ username: currentUser }).exec().then((userRes) => {
//                 if (userRes[0].CurrentHand.length == oldLength + 1) {
//                   console.log(userRes[0].CurrentHand)
//                   // console.log('returning from deal for ' + currentUser)
//                   console.log('dealt a card to ' + currentUser)
//                   res.end();
//                 }
//               })
//             })
//         })

//         .catch((error) => {
//           console.log(error);
//         });
//     }).catch((error) => {
//       console.log(error);
//     });
//   })
// })

// Will login the user and return a text. 
// If the username is valid it will return Login, 
// else it will return Login Failed.





// (POST) Should add an item to the database.
// The items information (title, description, image, price, status) 
//should be included as POST parameters. The item should be added the
// USERNAMEs list of listings.  
app.post('/add/user/', (req, res) => {
  let p = User.find({ username: req.body.username }).exec()
    .then((doc) => {
      console.log(doc.length)
      if (doc.length == 0) {
        var newUser = new User({
          username: req.body.username,
          password: req.body.password,
          balance: 1000,
          roundsPlayed: 0,
          Wins: 0,
          Losses: 0,
          Ties: 0,
          Total: 0
        });

        let p1 = newUser.save();
        p1.then((doc) => {
          res.end('Created new Account!');
        });
        p1.catch((err) => {
          console.log(err)
          res.end("Failed")
        });
      } else {
        res.end("Username Taken")
      }
    });
});

app.get('/get/user', (req, res) => {
  if (req.cookies && req.cookies.login) {
    let p = User.find({ username: req.cookies.login.username }).exec()
      .then((doc) => {
        res.end(JSON.stringify(doc[0]));
      })
  }
});

// app.get('/get/dealer', (req, res) => {

//   let p = User.find({ username: "Dealer" }).exec()
//     .then((doc) => {
//       res.end(JSON.stringify(doc[0]));
//     })
// });

// function checkAce(checkingCard) {
//   if (checkingCard.Name == "Ace") {
//     checkingCard.Value = 1;
//     return true;
//   }

// }

// app.get('/turn/dealer/', (req, res) => {
//   final = ''
//   var keepGoing = true;
//   console.log('starting dealer turn')
//   //while (keepGoing)
//   keepGoing = false;
//   let p2 = User.find({ username: "Dealer" }).exec();
//   p2.then((doc) => {
//     //console.log(doc[0].CurrentHand)
//     //console.log(doc[0].Total);
//     //console.log('this is doc' + doc[0]);
//     if (doc[0].Total > 21) {
//       console.log("busting dealer");
//       for (var r = 0; r < doc[0].CurrentHand.length; r++) {
//         if (checkAce(doc[0].CurrentHand[r])) {
//           console.log('here');
//           if (doc[0].Total > 21) {
//             continue;
//           }
//           else {
//             keepGoing = false;
//             final = "BUST";
//             res.end(final);
//           }
//           keepGoing = true;
//         }
//       }
//       keepGoing = false;
//       final = "BUST";
//       res.end(final);

//     }
//     if (doc[0].Total >= 17) {
//       console.log("dealer already has 17+, won't hit anymore");
//       keepGoing = false;
//       // console.log(keepGoing);
//       currentUser = req.cookies.login.username
//       p0 = User.find({ username: currentUser }).exec().then((results) => {
//         // temp = results[0];

//         // h = temp.CurrentHand;
//         // total = 0;
//         // for (var x in h) {
//         //   v = h[x];
//         //   total += v.Value;
//         // }
//         // console.log(total);
//         // return total;
//         return results[0].Total;

//       }).then((total) => {
//         console.log(total);
//         if (total > doc[0].Total) {
//           final = "PLAYER";
//           res.end(final);
//         }
//         else if (total == doc[0].Total) {
//           final = "TIE";
//           res.end(final);
//         }
//         else {
//           final = "DEALER";
//           res.end(final);
//         }
//       });

//     } else if (doc[0].Total > 21) {
//       console.log("busting dealer");
//       keepGoing = false;
//       final = "BUST";
//       res.end(final);
//     }
//     else {
//       console.log("hitting dealer");
//       keepGoing = true;
//       newCard("Dealer", doc[0].CurrentHand.length, res);
//       // newCard("Dealer");
//     }
//     //res.end("true");
//   })
// })



// function newCard(currentUser, oldLength, res) {
//   p1 = Card.find({ Player: "In Deck" }).exec();
//   p1.then((results) => {
//     var randomNumber = Math.floor(Math.random() * results.length);
//     console.log("yes");
//     var card = { "Suit": results[randomNumber].Suit, "Value": results[randomNumber].Value, "Name": results[randomNumber].Name }

//     Card.updateOne(
//       { _id: String(results[randomNumber]._id) },
//       { $set: { Player: currentUser } }).then(() => {
//         User.updateOne(
//           { username: currentUser },
//           {
//             $push: { CurrentHand: card },
//             $inc: { Total: card.Value }
//           }).then(() => {
//             User.find({ username: currentUser }).exec().then((userRes) => {
//               if (userRes[0].CurrentHand.length == oldLength + 1) {
//                 console.log(userRes[0].CurrentHand)
//                 // console.log('returning from deal for ' + currentUser)
//                 console.log('dealt a card to ' + currentUser)
//                 res.end("true");
//               }
//             })
//           })
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//   })
// }

// function winner(dealerhand) {
//   p = User.find({ username: req.cookies.login.username }).exec()
//   p.then((results) => {
//     if (results[0].Total == dealerhand) {
//       return "Tie"
//     } else if (results[0].Total > dealerhand) {
//       return "PLAYER"
//     } else if (results[0].Total > dealerhand) {
//       return "DEALER"
//     }
//   })
// }

app.post('/update/player/', (req, res) => {
  let p = User.find({ username: req.cookies.login.username }).exec()
    .then((doc) => {
      console.log(doc[0]);
      doc[0].updateOne(req.body)
        .then((results) => {
          res.end('Updated stats');
        });
      p1.catch((err) => {
        console.log(err)
        res.end("Failed")
      });
    })
})