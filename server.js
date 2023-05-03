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
const express = require('express');
const parser = require('body-parser')
const fs = require('fs');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { fail } = require('assert');
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*" } });
const crypto = require('crypto');
const cm = require('./customsessions');
const { setUncaughtExceptionCaptureCallback } = require('process');

cm.sessions.startCleanup();

const connection_string = 'mongodb://127.0.0.1:27017/blackjack';

mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});

// creates Schema for items 
var CardSchema = new mongoose.Schema({
  Suit: String,
  Name: String,
  Value: Number,
  Player: String,
  PlaceInDeck: Number
});
var Card = mongoose.model('Card', CardSchema);

// creates Schema for 
var UserSchema = new mongoose.Schema({
  username: String,
  salt: Number,
  hash: String,
  balance: Number,
  roundsPlayed: Number,
  Wins: Number,
  Losses: Number,
  Ties: Number,
  CurrentHand: [Object],
  Total: Number,
  player: String
});
var User = mongoose.model('User', UserSchema);

var DeckSchema = new mongoose.Schema({
  Game: String,
  Cards: [Number]
});
var Deck = mongoose.model('Deck', DeckSchema);

var GameSchema = new mongoose.Schema({
  Players: [String],
  Deck: Object,
  Turn: String,
  Code: String,
  Start: Number,
  Hands: [String],
  Finished: Boolean,
  ReadyForDealer: Number
})
var Game = mongoose.model('Game', GameSchema);
//Game.find({}).deleteMany().exec();


// It will redirected the page back to the login 
// if no cookie is found.
function authenticate(req, res, next) {
  let c = req.cookies;
  if (c && c.login) {
    let result = cm.sessions.doesUserHaveSession(c.login.username, c.login.sid);
    if (result) {
      next();
      return;
    }
  }
  res.redirect('/index.html');
}



app.use(cookieParser())
app.use( '/home.html', authenticate);
app.use('/mode.html', authenticate);
app.use('/multiGame.html', authenticate);
app.use('/singleGame.html', authenticate);
app.use('/waitingCustom.html', authenticate);
app.use('/Random.html', authenticate);

app.use(express.static('html_css_files'))


app.use(parser.urlencoded({ extended: true }));
app.use(express.json())
const upload = multer({ dest: __dirname + '/public_html/app' });


app.use('*', (req, res, next) => {
  let c = req.cookies;
  if (c && c.login) {
    if (cm.sessions.doesUserHaveSession(c.login.username, c.login.sid)) {
      cm.sessions.addOrUpdateSession(c.login.username);
    }
  }
  next();
});

// (GET) Changes the id status from SALE to SOlD
// Pushes the item id to purchase list of the user.
hands = {}
app.get('/start/deal/', (req, res) => {
  var currentUser = req.cookies.login.username;
  resetDeck(currentUser, res)
})

function resetDeck(currentUser, res) {
  p1 = Card.updateMany({ Player: { $regex: `^(?!.*In Deck)` } },
    { $set: { Player: "In Deck" } })
  User.updateOne(
    { username: currentUser },
    {
      $set: { CurrentHand: [], Total: 0 }
    }).then(() => {
      User.find({ username: currentUser }).exec().then((results) => {
        //console.log(results)
      }).then(() => {


        User.find({ username: "Dealer" }).deleteMany().exec().then(() => {
          var ourDealer = new User({
            username: "Dealer",
            password: "Dealer",
            balance: 0,
            roundsPlayed: 0,
            Wins: 0,
            Losses: 0,
            Ties: 0,
            Total: 0,
            player: "Dealer"
          });

          ourDealer.save().then(() => {
            newCards(currentUser, res);
            return;
          })
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })
}



function newCards(currentUser, res) {
  let p = Card.find({}).deleteMany().exec().then((result) => {
    //console.log(result)
    const lineReader = require('line-reader');
    lineReader.eachLine('./cards.txt', function (line, last) {
      if (line[0] != '#') {
        var params = line.split(',');
        var newCard = new Card({
          Suit: params[0],
          Name: params[1],
          Value: Number(params[3]),
          Player: "In Deck",
          PlaceInDeck: Number(params[4])
        });

        newCard.save()
      }
      if (last) {
        Card.find({}).exec().then((cards) => {
          //console.log(cards)
          makeDeck(currentUser, res);
        })
      }
    });
  })
}

function makeDeck(curUser, res) {
  Deck.find({ Game: curUser }).deleteMany().exec().then(() => {
    deckArr = shuffleDeck();
    var newDeck = new Deck({
      Game: curUser,
      Cards: deckArr
    })

    newDeck.save().then(() => {
      deal2(curUser, curUser, res)
    })
  })
}

function shuffleDeck() {
  var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]
  let curIndex = arr.length, randomIndex;
  while (curIndex != 0) {
    randomIndex = Math.floor(Math.random() * curIndex);
    curIndex--;

    [arr[curIndex], arr[randomIndex]] = [arr[randomIndex], arr[curIndex]]
  }
  //console.log(arr)
  return arr;
}

function deal2(currentUser, gameHolder, res) {
  console.log('dealing ' + currentUser)
  User.find({ username: currentUser }).exec().then((userRes) => {
    us = userRes[0]

    Deck.find({ Game: gameHolder }).exec().then((deckRes) => {
      Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
        if (us.Total >= 11 && cardRes[0].Name == 'Ace') {
          var card = { "Suit": cardRes[0].Suit, "Value": 1, "Name": cardRes[0].Name }
          var cardVal = 1;
        }
        else {
          var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
          var cardVal = card.Value
        }
        User.updateOne(
          { username: currentUser },
          {
            $push: { CurrentHand: card },
            $inc: { Total: cardVal }
          }
        ).then((saveRes) => {
          // console.log(saveRes)
          Deck.updateOne(
            { Game: gameHolder },
            { $pop: { Cards: -1 } }
          ).then(() => {
            Deck.find({ Game: gameHolder }).exec().then((deckRes2) => {
              //console.log(deckRes2[0].Cards.length)
            }).then(() => {
              User.find({ username: gameHolder }).exec().then((userRes) => {
                User.find({ username: "Dealer" }).exec().then((dealerRes) => {
                  //console.log('user length: ' + userRes[0].CurrentHand.length);
                  //console.log('dealer length: ' + dealerRes[0].CurrentHand.length);
                  if (userRes[0].CurrentHand.length == 2 && dealerRes[0].CurrentHand.length == 2) {
                    // console.log('returning from deal for ' + currentUser)
                    initialAceCheck(currentUser)
                    initialAceCheck("Dealer")
                    console.log('all cards have been dealt, returning to client')
                    // Card.find({Player: "In Deck"}).exec().then((resultsa) => {console.log(resultsa); console.log(resultsa.length)});
                    res.end();
                  }
                  else if (userRes[0].CurrentHand.length == 1 && dealerRes[0].CurrentHand.length == 0) {
                    deal2("Dealer", gameHolder, res)
                  }
                  else if (userRes[0].CurrentHand.length == 1 && dealerRes[0].CurrentHand.length == 1) {
                    deal2(gameHolder, gameHolder, res)
                  }
                  else if (userRes[0].CurrentHand.length == 2 && dealerRes[0].CurrentHand.length == 1) {
                    deal2("Dealer", gameHolder, res)
                  }
                })
              })
            })
          })
        })
      })
    })
  })
}

function initialAceCheck(currentUser) {
  User.find({ username: currentUser }).exec().then((userRes) => {
    let suit1 = userRes[0].CurrentHand[0].Suit;
    let name1 = userRes[0].CurrentHand[0].Name;
    let val1 = userRes[0].CurrentHand[0].Value;
    let val2 = userRes[0].CurrentHand[1].Value;
    if (val1 == 11 && val2 == 11) {
      var card = { "Suit": suit1, "Value": 1, "Name": name1 }
      User.updateOne(
        { username: currentUser },
        { $pop: { CurrentHand: -1 } }
      ).then(() => {
        User.updateOne(
          { username: currentUser },
          { $push: { CurrentHand: card } }
        ).then(() => {
          return;
        })
      })
    }
  })
}

function aceCheck(userData, i, final, res) {
  return new Promise((resolve, reject) => {
    if (userData.CurrentHand[i].Value != 11) {
      //console.log('in ace check, card is not an ace, returning to route')
      resolve();
      // User.find({ username: userData.username }).exec().then((results) => {
      //   console.log("i=" + i + ", " + results[0].Total)
      //   if (i == final) {
      //     console.log('i == final, sending back to route')
      //     res.end(JSON.stringify(results[0]))
      //   }
      // })
    }
    else {
      changeStr = "CurrentHand." + i + ".Value";
      //console.log(userData.CurrentHand[i].Value);
      updateAce(userData).then((changeRes) => {
        //console.log(changeRes)
        console.log('updated value of ace to 1, this is the hand now:')
        User.find({ username: userData.username }).exec().then((results) => {
          //console.log(results[0].CurrentHand)
          //console.log("i=" + i + ", " + results[0].Total)
          if (i == final) {
            //console.log('i == final, sending back to route')
            if (userData.username == "Dealer") {
              resolve();
            }
            else {
              res.end(JSON.stringify(results[0]))
            }

          }
          else if (results[0].Total < 21) {
            if (userData.username == "Dealer") {
              resolve();
            }
            else {
              //console.log('total is <21 now, sending back to client')
              res.end(JSON.stringify(results[0]))
            }

          }
        })
      })
    }
  })
}

async function callAceCheck(us, res) {
  let i = 0;
  for (i; i < us.CurrentHand.length; i++) {
    if (us.Total > 21) {
      //console.log('sending to aceCheck(), i = ' + i)
      const result = await aceCheck(us, i, us.CurrentHand.length - 1, res);
    }
  }
  return;
}

async function updateAce(userData) {
  const query = { username: userData.username, "CurrentHand.Value": 11 };
  //console.log(query)
  const updateDocument = {
    $set: { "CurrentHand.$.Value": 1 },
    $inc: { Total: -10 }
  }
  const result = await User.updateOne(query, updateDocument);
  return result;
}

app.get('/get/hand/', (req, res) => {
  res.end(JSON.stringify(hand))
})

app.get('/hit/card/', (req, res) => {
  let currentUser = req.cookies.login.username;
  User.find({ username: currentUser }).exec().then((results) => {
    return results[0]
  }).then((us) => {
    //console.log(us.Total);
    if (us.Total > 21) {
      res.end();
    }
    return us;
  }).then((us) => {
    var oldLength = us.CurrentHand.length
    Deck.find({ Game: currentUser }).exec().then((deckRes) => {
      Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
        if (us.Total >= 11 && cardRes[0].Name == 'Ace') {
          var card = { "Suit": cardRes[0].Suit, "Value": 1, "Name": cardRes[0].Name }
          var cardVal = 1;
        }
        else {
          var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
          var cardVal = card.Value
        }
        User.updateOne(
          { username: currentUser },
          {
            $push: { CurrentHand: card },
            $inc: { Total: cardVal }
          }
        ).then((saveRes) => {
          Deck.updateOne(
            { Game: currentUser },
            { $pop: { Cards: -1 } }
          ).then(() => {
            Deck.find({ Game: currentUser }).exec().then((deckResu) => {
              //console.log(deckResu[0].Cards[0])
            }).then(() => {
              User.find({ username: currentUser }).exec().then((userRes) => {
                if (userRes[0].CurrentHand.length == oldLength + 1) {
                  console.log(userRes[0].CurrentHand)
                  // console.log('returning from deal for ' + currentUser)
                  console.log('dealt a card to ' + currentUser)
                  res.end();
                }
              })
            })
          })
        })
      })
    })
  })
})

app.get('/check/ace/', (req, res) => {
  let currentUser = req.cookies.login.username;
  User.find({ username: currentUser }).exec().then((results) => {
    return results[0];
  }).then((us) => {
    //console.log('in the server route')
    callAceCheck(us, res).then(() => {
      User.find({ username: currentUser }).exec().then((results) => {
        //console.log('in route and returning to client')
        res.end(JSON.stringify(results[0]));
      })
    })
  })
  //return us.CurrentHand.length;
}
)

// Will login the user and return a text. 
// If the username is valid it will return Login, 
// else it will return Login Failed.
app.post('/account/login/', (req, res) => {
  var { u, p } = req.body;
  let p1 = User.find({ username: u })
  currentUser = req.body.username;
  p1.then((results) => {
    if (results.length == 1) {
      let existingSalt = results[0].salt;
      let toHash = p + existingSalt;
      var hash = crypto.createHash('sha3-256');
      let data = hash.update(toHash, 'utf-8');
      let newHash = data.digest('hex');
      if (newHash == results[0].hash) {
        let id = cm.sessions.addOrUpdateSession(u);
        res.cookie("login", { username: u, sid: id }, { maxAge: 60000 * 60 * 24 });
        res.send("LOGIN");
      } else {
        res.end("Login Failed")
      }
    } else {
      res.end("Login Failed")
    }
  });
});

// (POST) Should add an item to the database.
// The items information (title, description, image, price, status) 
//should be included as POST parameters. The item should be added the
// USERNAMEs list of listings.  
app.post('/add/user/', (req, res) => {
  let p = User.find({ username: req.body.username }).exec()
    .then((doc) => {
      //console.log(doc.length)
      if (doc.length == 0) {

        let newSalt = Math.floor((Math.random() * 1000000));
        let toHash = req.body.password + newSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');

        var newUser = new User({
          username: req.body.username,
          salt: newSalt,
          hash: newHash,
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
const port = 80;
server.listen(port, () => {
  console.log('server has started');
});

app.get('/get/user', (req, res) => {
  if (req.cookies && req.cookies.login) {
    User.find({ username: req.cookies.login.username }).exec()
      .then((doc) => {
        res.end(JSON.stringify(doc[0]));
      })
  }
});

app.get('/get/dealer', (req, res) => {
  User.find({ username: "Dealer" }).exec()
    .then((doc) => {
      res.end(JSON.stringify(doc[0]));
    })
});

app.get('/turn/dealer/', (req, res) => {
  final = ''
  var currentUser = req.cookies.login.username
  console.log('starting dealer turn')
  let p2 = User.find({ username: "Dealer" }).exec();
  p2.then((doc) => {
    // console.log(doc[0].CurrentHand)
    // console.log(doc[0].Total);
    if (doc[0].Total > 21) {
      callAceCheck(doc[0], res).then(() => {
        User.find({ username: "Dealer" }).exec().then((newDoc) => {
          if (newDoc[0].Total > 21) {
            console.log("busting dealer");
            final = "BUST";
            res.end(final);
          }
          else {

          }
        })
      })
    }
    User.find({ username: "Dealer" }).exec().then((doc) => {
      //console.log(doc[0].Total)
      if (doc[0].Total >= 17) {
        //console.log("dealer already has 17+, won't hit anymore");
        p0 = User.find({ username: currentUser }).exec().then((results) => {
          return results[0].Total;
        }).then((total) => {
          var userTot = total;
          User.find({ username: "Dealer" }).exec().then((doc) => {
            //console.log("usertotal: " + userTot)
            //console.log('dealerTotal: ' + doc[0].Total)
            if (doc[0].Total < 17) {
              console.log("hitting dealer");
              newCard("Dealer", currentUser, doc[0].CurrentHand.length, res);
            }
            else if (userTot > doc[0].Total) {
              final = "PLAYER";
              console.log('user wins')
              res.end(final);
            }
            else if (userTot == doc[0].Total) {
              final = "TIE";
              console.log('tie')
              res.end(final);
            }
            else {
              final = "DEALER";
              console.log('dealer wins')
              res.end(final);
            }
          })
        });

      } else if (doc[0].Total > 21) {
        console.log("busting dealer");
        final = "BUST";
        res.end(final);
      }
      else {
        console.log("hitting dealer");
        newCard("Dealer", currentUser, doc[0].CurrentHand.length, res);
      }
    })


  })
})

function newCard(currentUser, gameHolder, oldLength, res) {
  Deck.find({ Game: gameHolder }).exec().then((deckRes) => {
    Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
      //console.log(deckRes[0].Cards)
      var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
      User.updateOne(
        { username: currentUser },
        {
          $push: { CurrentHand: card },
          $inc: { Total: cardRes[0].Value }
        }
      ).then((saveRes) => {
        Deck.updateOne(
          { Game: gameHolder },
          { $pop: { Cards: -1 } }
        ).then(() => {
          User.find({ username: currentUser }).exec().then((userRes) => {
            if (userRes[0].CurrentHand.length == oldLength + 1) {
              //console.log(userRes[0].CurrentHand)
              // console.log('returning from deal for ' + currentUser)
              console.log('dealt a card to ' + currentUser)
              res.end("true");
            }
          })
        })
      }).catch((err) => {
        console.log(err)
      })
    })
  })
}

app.post('/update/player/', (req, res) => {
  let p = User.find({ username: req.cookies.login.username }).exec()
    .then((doc) => {
      //console.log(doc[0]);
      doc[0].updateOne(req.body)
        .then((results) => {
          res.end('Updated stats');
        })
        .catch((err) => {
          console.log(err)
          res.end("Failed")
        });
    })
})

function loadcards(currentUser, res) {
  let p = Card.find({}).deleteMany().exec().then((result) => {
    console.log(result)
    const lineReader = require('line-reader');
    count = 0;
    lineReader.eachLine('./cards.txt', function (line, last) {
      if (line[0] != '#') {
        var params = line.split(',');
        //console.log(params)
        var newCard = new Card({
          Suit: params[0],
          Name: params[1],
          Value: Number(params[3]),
          Player: "In Deck",
          PlaceInDeck: Number(params[4])
        });

        newCard.save().then(() => {
          count++;
        })

      }
      if (last) {
        Card.find({}).exec().then((cards) => {
          //console.log(cards)
        })
        // makeDeck(currentUser, res)
        deal(currentUser, res)
        deal("Dealer", res)
      }
    });
  })
}

app.post('/new/random/game/', (req, res) => {
  console.log('finding new game')
  let un = req.body.username;
  Game.find({ "Players.2": { $exists: false }, Code: { $exists: false } }).exec().then((results) => {
    if (results.length > 0) {
      let curID = results[0]._id;
      Game.updateOne(
        { _id: curID },
        { $push: { Players: un } }
      ).then(() => {
        User.updateOne(
          { username: un },
          {
            $set: { CurrentHand: [], Total: 0 }
          }).then(() => {
            res.end("Added")
          })

      })
    }
    else {
      var newGame = new Game({
        Players: [un],
        Turn: un
      });
      newGame.save().then(() => {
        User.updateOne(
          { username: un },
          {
            $set: { CurrentHand: [], Total: 0 }
          }).then(() => {
            res.end("Created")
          })
      })
    }
  })
});

app.post('/new/code/game/', (req, res) => {
  console.log('creating coded game');

  let un = req.body.username;
  Game.find({ Player: un }).exec().then((result) => {
    if (result.length == 0) {
      var code = makeCode()
      var newGame = new Game({
        Players: [un],
        Code: code,
        Turn: un
      });
      newGame.save().then(() => {
        User.updateOne(
          { username: un },
          {
            $set: { CurrentHand: [], Total: 0 }
          }).then(() => {
            res.end(code)
          })
      })
    }
  })
})

function makeCode() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let counter = 0;
  while (counter < 6) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
}

app.get('/waiting/players/', (req, res) => {
  console.log('finding waiting players')
  let un = req.cookies.login.username;
  console.log(un)

  Game.find({ Players: un }).exec().then((results) => {
    console.log(results)
    if (results[0]) {
      console.log("sending json")
      res.end(JSON.stringify(results))
    }
    else {
      console.log("not sending json")
      res.end(JSON.stringify(results))
    }

  })
})

app.get('/is/game/ready/', (req, res) => {
  console.log('finding if game is ready')
  let un = req.cookies.login.username;
  Game.find({ Players: un }).exec().then((results) => {
    if (results[0]) {
      if (results[0].Players.length == 3) {
        res.end("true")
      }
      else (
        res.end("false")
      )
    }
  })
});

console.log('deleting games')
Game.find({}).deleteMany().exec().then(() => {
})

app.post('/enter/code/room', (req, res) => {
  let un = req.body.username;
  let code = req.body.code;

  Game.find({ Code: code }).exec().then((results) => {
    if (results.length == 1) {
      Game.updateOne(
        { Code: code },
        { $push: { Players: un } }
      ).then(() => {
        User.updateOne(
          { username: un },
          {
            $set: { CurrentHand: [], Total: 0 }
          }).then(() => {
            res.end("Success")
          })
      })
    }
    else {
      res.end("Invalid Code")
    }
  })
})

app.post('/player/ready/', (req, res) => {
  let n = req.cookies.login.username;
  Game.find({ Players: n }).exec().then((results) => {
    thisId = results[0]._id;
    thisCount = results[0].Start;
    thisString = results[0].Players.join("");
    Game.updateOne(
      { _id: thisId },
      { $inc: { Start: 1 } }
    ).then(() => {
      if (thisCount == 2) {
        
        multiGameDealing(thisString, results[0], res);
      }

      res.end("Okay");



    })
  })
})

function multiGameDealing(thisString, gameObj, res) {
  Deck.find({ Game: thisString }).exec().then((deckRes) => {
    if (deckRes.length[0]) {
      return;
    }
    else {
      User.find({ username: "Dealer" + thisString }).deleteMany().exec().then(() => {
        var ourDealer = new User({
          username: "Dealer" + thisString,
          password: "Dealer" + thisString,
          balance: 0,
          roundsPlayed: 0,
          Wins: 0,
          Losses: 0,
          Ties: 0,
          Total: 0,
          player: "Dealer" + thisString
        });

        ourDealer.save().then(() => {
          newCards2(thisString, gameObj);
          return;
        })

      })
    }
  })
}

app.get('/are/cards/dealt/', (req, res) => {
  let n = req.cookies.login.username;
  Game.find({ Players: n }).exec().then((results) => {
    console.log(results[0])
    res.end(JSON.stringify(results[0]))
  })
})

function newCards2(currentUser, gameObject) {
  let p = Card.find({}).deleteMany().exec().then((result) => {
    //console.log(result)
    const lineReader = require('line-reader');
    lineReader.eachLine('./cards.txt', function (line, last) {
      if (line[0] != '#') {
        var params = line.split(',');
        var newCard = new Card({
          Suit: params[0],
          Name: params[1],
          Value: Number(params[3]),
          Player: "In Deck",
          PlaceInDeck: Number(params[4])
        });

        newCard.save()
      }
      if (last) {
        Card.find({}).exec().then((cards) => {
          //console.log(cards)
          makeDeck2(currentUser, gameObject);
        })
      }
    });
  })
}

function makeDeck2(curUser, gameObject) {
  Deck.find({ Game: curUser }).deleteMany().exec().then(() => {
    deckArr = shuffleDeck();
    var newDeck = new Deck({
      Game: curUser,
      Cards: deckArr
    })

    newDeck.save().then(() => {
      dealingLogic(curUser, gameObject)
      //deal3(curUser, curUser, gameObject, res)
    })
  })
}

function dealingLogic(gameName, gameObject) {

  players = gameObject.Players;
  Game.find({ Players: players[0] }).exec().then((ans) => {
    deal3(players[0], gameName, players, 1, ans[0]._id)
  })

}

function deal3(currentUser, gameHolder, players, dealtNum, gameID) {
  console.log('dealing ' + currentUser)
  User.find({ username: currentUser }).exec().then((userRes) => {
    us = userRes[0]
    Deck.find({ Game: gameHolder }).exec().then((deckRes) => {
      Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
        cardFileName = (cardRes[0].Suit + cardRes[0].Name).toLowerCase()
        var gameString = currentUser + ' ' + cardFileName;
        //console.log("pushing" + gameString)
        if (us.Total >= 11 && cardRes[0].Name == 'Ace') {
          var card = { "Suit": cardRes[0].Suit, "Value": 1, "Name": cardRes[0].Name }
          var cardVal = 1;
        }
        else {
          var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
          var cardVal = card.Value
        }
        console.log(card)
        User.updateOne(
          { username: currentUser },
          {
            $push: { CurrentHand: card },
            $inc: { Total: cardVal }
          }
        ).then((saveRes) => {
          // console.log(saveRes)
          Deck.updateOne(
            { Game: gameHolder },
            { $pop: { Cards: -1 } }
          ).then(() => {
            console.log("pushing" + gameString)
            Game.updateOne(
              { _id: gameID },
              { $push: { Hands: gameString } }
            ).then(() => {
              Deck.find({ Game: gameHolder }).exec().then((deckRes2) => {
                //console.log(deckRes2[0].Cards.length)
              }).then(() => {
                if (dealtNum == 1 || dealtNum == 5) {
                  deal3(players[1], gameHolder, players, dealtNum + 1, gameID)
                }
                else if (dealtNum == 2 || dealtNum == 6) {
                  deal3(players[2], gameHolder, players, dealtNum + 1, gameID)
                }
                else if (dealtNum == 3 || dealtNum == 7) {
                  deal3("Dealer" + gameHolder, gameHolder, players, dealtNum + 1, gameID)
                }
                else if (dealtNum == 4) {
                  deal3(players[0], gameHolder, players, dealtNum + 1, gameID)
                }
                else if (dealtNum == 8) {
                  return;
                }
              })
            })
          })
        })
      })
    })
  })
}

app.get('/all/players/cards', (req, res) => {
  let n = req.cookies.login.username;
  Game.find({ Players: n }).exec().then((results) => {
    console.log(results[0])
    res.end(JSON.stringify(results[0]))
  })
})

app.get('/hit/card/multi/', (req, res) => {
  let currentUser = req.cookies.login.username;
  console.log('hitting ' + currentUser)
  User.find({ username: currentUser }).exec().then((results) => {
    console.log(results[0])
    return results[0]
  }).then((us) => {
    //console.log(us.Total);
    if (us.Total > 21) {
      res.end();
    }
    else {
      console.log(us)
      return us;
    }

  }).then((us) => {
    var oldLength = us.CurrentHand.length
    Game.find({ Players: currentUser }).exec().then((gameRes) => {

      var gameID = gameRes[0]._id
      var deckGame = gameRes[0].Players.join("")
      console.log(deckGame)
      Deck.find({ Game: deckGame }).exec().then((deckRes) => {
        deckNow = deckRes[0]
        Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
          var cardFileName = (cardRes[0].Suit + cardRes[0].Name).toLowerCase()
          var gameString = currentUser + ' ' + cardFileName;
          if (us.Total >= 11 && cardRes[0].Name == 'Ace') {
            var card = { "Suit": cardRes[0].Suit, "Value": 1, "Name": cardRes[0].Name }
            var cardVal = 1;
          }
          else {
            var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
            var cardVal = card.Value
          }
          User.updateOne(
            { username: currentUser },
            {
              $push: { CurrentHand: card },
              $inc: { Total: cardVal }
            }
          ).then((saveRes) => {
            Deck.updateOne(
              { Game: deckGame },
              { $pop: { Cards: -1 } }
            ).then(() => {
              Game.updateOne(
                { _id: gameID },
                { $push: { Hands: gameString } }
              ).then(() => {
                Deck.find({ Game: deckGame }).exec().then((deckResu) => {
                  //console.log(deckResu[0].Cards[0])
                }).then(() => {
                  User.find({ username: currentUser }).exec().then((userRes) => {
                    if (userRes[0].CurrentHand.length == oldLength + 1) {

                      console.log(userRes[0].CurrentHand)
                      // console.log('returning from deal for ' + currentUser)
                      console.log('dealt a card to ' + currentUser)
                      res.end();
                    }
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

app.get('/switch/turn', (req, res) => {
  let n = req.cookies.login.username
  Game.find({ Players: n }).exec().then((gameRes) => {
    var idGame = gameRes[0]._id;
    if (gameRes[0].Players[0] == gameRes[0].Turn) {
      Game.updateOne(
        { _id: gameRes[0]._id },
        { $set: { Turn: gameRes[0].Players[1] } }
      ).then(() => {
        res.end()
      })
    } else if (gameRes[0].Players[1] == gameRes[0].Turn) {
      Game.updateOne(
        { _id: gameRes[0]._id },
        { $set: { Turn: gameRes[0].Players[2] } }
      ).then(() => {
        res.end()
      })
    } else if (gameRes[0].Players[2] == gameRes[0].Turn) {
      Game.updateOne(
        { _id: gameRes[0]._id },
        { $set: { Turn: "Dealer" } }
      ).then(() => {
        shouldHitDealer(idGame)
        res.end()
      })
    }
  })
})

function shouldHitDealer(gameID) {
  Game.find({ _id: gameID }).exec().then((gameRes) => {
    dealerString = "Dealer" + gameRes[0].Players.join("")
    User.find({ username: dealerString }).exec().then((dealerRes) => {
      if (dealerRes[0].Total < 17) {
        hitDealerMulti(dealerString, gameID);
      }
      else if (dealerRes[0].Total > 21) {
        callAceCheckDealer(dealerRes[0])
        User.find({username: dealerString}).exec().then((deal) => {
          if (deal[0].Total < 17) {
            hitDealerMulti(dealerString, gameID);
          }
          else {
            endGame(dealerString, gameID)
          }
        })
      }
      else if (dealerRes[0].Total > 16) {
        endGame(dealerString, gameID);
      }
    })
  })
}

function hitDealerMulti(dealerName, gameID) {
  let currentUser = dealerName;
  console.log('hitting ' + currentUser)
  User.find({ username: currentUser }).exec().then((results) => {
    return results[0]
  }).then((us) => {
    var oldLength = us.CurrentHand.length
    Game.find({ _id: gameID }).exec().then((gameRes) => {
      var deckGame = gameRes[0].Players.join("")
      Deck.find({ Game: deckGame }).exec().then((deckRes) => {
        deckNow = deckRes[0]
        Card.find({ PlaceInDeck: deckRes[0].Cards[0] }).exec().then((cardRes) => {
          var cardFileName = (cardRes[0].Suit + cardRes[0].Name).toLowerCase()
          var gameString = currentUser + ' ' + cardFileName;
          if (us.Total >= 11 && cardRes[0].Name == 'Ace') {
            var card = { "Suit": cardRes[0].Suit, "Value": 1, "Name": cardRes[0].Name }
            var cardVal = 1;
          }
          else {
            var card = { "Suit": cardRes[0].Suit, "Value": cardRes[0].Value, "Name": cardRes[0].Name }
            var cardVal = card.Value
          }
          User.updateOne(
            { username: dealerName },
            {
              $push: { CurrentHand: card },
              $inc: { Total: cardVal }
            }
          ).then((saveRes) => {
            Deck.updateOne(
              { Game: deckGame },
              { $pop: { Cards: -1 } }
            ).then(() => {
              Game.updateOne(
                { _id: gameID },
                { $push: { Hands: gameString } }
              ).then(() => {
                Deck.find({ Game: deckGame }).exec().then((deckResu) => {
                  //console.log(deckResu[0].Cards[0])
                }).then(() => {
                  User.find({ username: dealerName }).exec().then((userRes) => {
                    if (userRes[0].CurrentHand.length == oldLength + 1) {

                      console.log(userRes[0].CurrentHand)
                      // console.log('returning from deal for ' + currentUser)
                      console.log('dealt a card to ' + currentUser)
                      shouldHitDealer(gameID);
                    }
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

function aceCheckDealer(userData, i, final) {
  return new Promise((resolve, reject) => {
    if (userData.CurrentHand[i].Value != 11) {
      //console.log('in ace check, card is not an ace, returning to route')
      resolve();
      // User.find({ username: userData.username }).exec().then((results) => {
      //   console.log("i=" + i + ", " + results[0].Total)
      //   if (i == final) {
      //     console.log('i == final, sending back to route')
      //     res.end(JSON.stringify(results[0]))
      //   }
      // })
    }
    else {
      changeStr = "CurrentHand." + i + ".Value";
      //console.log(userData.CurrentHand[i].Value);
      updateAceDealer(userData).then((changeRes) => {
        //console.log(changeRes)
        console.log('updated value of ace to 1, this is the hand now:')
        User.find({ username: userData.username }).exec().then((results) => {
          if (i == final) {
            //console.log('i == final, sending back to route')
            resolve()

          }
          else if (results[0].Total < 21) {
            resolve()
          }
            else {
              //console.log('total is <21 now, sending back to client')
              resolve()
            }

          }

        )
      }
  )}
    })}

async function callAceCheckDealer(us) {
  let i = 0;
  for (i; i < us.CurrentHand.length; i++) {
    if (us.Total > 21) {
      //console.log('sending to aceCheck(), i = ' + i)
      const result = await aceCheckDealer(us, i, us.CurrentHand.length - 1);
    }
  }
  return;
}

async function updateAceDealer(userData) {
  const query = { username: userData.username, "CurrentHand.Value": 11 };
  //console.log(query)
  const updateDocument = {
    $set: { "CurrentHand.$.Value": 1 },
    $inc: { Total: -10 }
  }
  const result = await User.updateOne(query, updateDocument);
  return result;
}

function endGame(dealerString, gameID) {
  Game.updateOne(
    { _id: gameID },
    { $set: { Finished: true } }
  ).then(() => {

  })
}

app.get('/is/it/my/turn/yet/', (req, res) => {
  let n = req.cookies.login.username
  Game.find({ Players: n }).exec().then((gameRes) => {
    if (gameRes[0]) {
      if (gameRes[0].Turn == n) {
        res.end("true")
      }
      else {
        res.end("false")
      }
    }
  })
})

app.get('/is/it/the/dealers/turn', (req, res) => {
  let n = req.cookies.login.username
  Game.find({ Players: n }).exec().then((gameRes) => {
    if (gameRes[0]) {
      if (gameRes[0].Turn == "Dealer") {
        res.end("true")
      }
      else {
        res.end("false")
      }
    }
  })
})

app.get('/update/my/screen/', (req, res) => {
  Game.find({ Players: req.cookies.login.username }).exec().then((gameRes) => {
    res.end(JSON.stringify(gameRes[0]))
  })
})

app.get('/get/dealer/multi', (req, res) => {
  Game.find({ Players: req.cookies.login.username }).exec().then((gameRes) => {
    dealerString = "Dealer" + gameRes[0].Players.join("");
    User.find({ username: dealerString }).exec()
      .then((doc) => {
        res.end(JSON.stringify(doc[0]));
      })
  })
})

app.get('/ready/for/dealer', (req, res) => {
  username = req.cookies.login.username;
  Game.find({Players: username}).exec().then((gameRes) => {
    gameId = gameRes[0]._id
  }).then(() => {
    Game.updateOne(
      {_id: gameId},
      {$inc: {ReadyForDealer: 1}}
    ).then(() => {
      console.log(username + " is ready for dealer")
      res.end("ready")
    })
  })
})

app.get('/is/dealer/done', (req, res) => {
  username = req.cookies.login.username;
  Game.find({Players: username}).exec().then((gameRes) => {
    if (gameRes[0].Finished == true) {
      setTimeout(() => {resetMultiGame(gameRes[0]._id)}, 10000)
      res.end("yes")
    } else {
      res.end("no")
    }
  })
})

function resetMultiGame(gameID) {
  Game.updateOne(
    {_id: gameId},
    { $set: {Players: [], Hands: []}},
    { $unset: {Turn:"", Start:"", Deck:"", Finished: "", ReadyForDealer: ""}}
  )
}
app.post('/logout', (req, res) => {
  console.log("HELP")
  res.clearCookie('login');
  res.end()
});