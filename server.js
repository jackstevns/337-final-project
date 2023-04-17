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

const connection_string = 'mongodb://127.0.0.1:27017/blackjack';


mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});
// creates Schema for items 
var CardSchema = new mongoose.Schema( {
    Suit: String,
    FaceCard: Boolean,
    Value: Number,
    Player: String
});
var Card = mongoose.model('Card', CardSchema);


// creates Schema for 
var UserSchema = new mongoose.Schema( {
  username: String,
  password: String,
  balance: Number,
  roundsPlayed: Number,
  Wins: Number,
  Losses: Number,
  Ties: Number,
  CurrentHand:[Object]
});
var User = mongoose.model('User', UserSchema);

//add current session
sessions = {}
function  addSession(user) {
  var sessionId = Math.floor(Math.random() * 100000);
  var sessionStart = Date.now();
  sessions[user] = {'sid': sessionId, 'start': sessionStart};
  return sessionId;
}

//checks to see if user has active session
function doesUserHaveSession(user,sessionId){
  let entry = sessions[user]
  if (entry != undefined){ 
    return entry.sid === sessionId
  }
  return false;
}

// cleans up session once they reach a certain age
const SESSION_LENGTH = 6000000

function  cleanupSeasons(){
  let CurrentTime = Date.now()
  for( i in sessions) {
    let sess = sessions[i];
    if (sess.start + SESSION_LENGTH < CurrentTime){
      console.log('removing session for user: '+ i)
      delete sessions[i]
    }else{
      console.log('keeping session for user: ' + i)
    }
  }
}

setInterval(cleanupSeasons, 6000000)

// It will redirected the page back to the login 
// if no cookie is found.
function authenticate ( req, res, next){
  let c = req.cookies;
  
  if (c && c.login){
    
    let results = doesUserHaveSession(c.login.username, c.login.sid);
    if (results){
      next();
      return; 
    }
  }
  res.redirect('/index.html');
}


const app = express();
app.use(cookieParser())
app.use('/app/*', authenticate);

app.use(express.static('html_css_files'))


app.use(parser.urlencoded({ extended: true }));
app.use(express.json())
const upload = multer({dest: __dirname + '/public_html/app'});





//(GET) Should return a JSON array containing 
//the information for every item in the database.
app.get('/get/items/', (req, res) => {

    let p1 = Item.find({}).exec();
    p1.then( (results) => { 
      res.end((JSON.stringify(results)));
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });
});


// (GET) Should return a JSON array containing 
//every listing (item)for the user USERNAME
app.get('/get/listings', (req, res) => {
  let getuser = req.cookies.login.username;
  let p1 = User.find({username: getuser}).exec();
  p1.then( (doc) => { 
    if(doc.length != 0){
    let searchList = (doc[0].listings);
    let p2 = Item.find({_id: {$in: searchList}}).exec();
    p2.then((results) => {
      res.send(JSON.stringify(results));
    });
    p2.catch((error) => {
      console.log(error)
      res.end("FAIL SEARCH")
    })
   }else{
    res.end(JSON.stringify(doc))
   }});
  p1.catch( (error) => {
    console.log(error);
    res.end('FAIL');
  });
});


//(GET) Should return a JSON array 
//containing every purchase (item) for the user USERNAME.
app.get('/get/purchases', (req, res) => {
    
    let getuser = req.cookies.login.username;
    
    let p1 = User.find({username: getuser}).exec();
    p1.then( (doc) => {
      if (doc.length != 0){ 
      let searchList = (doc[0].purchases);
      let p2 = Item.find({_id: {$in: searchList}}).exec();
      p2.then((results) => {
        res.end(JSON.stringify(results));
      });
      p2.catch((error) => {
        console.log(error)
        res.end("FAIL SEARCH")
      })
     }else{
      res.end(JSON.stringify(doc))
     }});
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });
});


//(GET) Should return a JSON list of every item
// whose description has the substring KEYWORD
app.get('/search/items/:KEYWORD', (req, res) => {
    let keyWord = req.params.KEYWORD;
    p1 = Item.find({description: {$regex:".*"+keyWord+".*"}}).exec();

    p1.then( (results) => { 
      res.end( JSON.stringify(results) );
    });
    p1.catch( (error) => {
      console.log(error);
      res.end('FAIL');
    });
});


// (GET) Changes the id status from SALE to SOlD
// Pushes the item id to purchase list of the user.
deck = []
app.get('/start/deal/', (req, res) => {
  resetDeck()
  var currentUser = req.cookies.login.username
  var retvalplayer = 0
  var retvalDealer = 0
  p1 = Card.find({Player: "In Deck"}).exec();
  p1.then((results) => {
    for (i in results){
      deck.push(String(results[i]._id))
    }
    deal(currentUser)
    deal("Dealer")
    
  })
});
function resetDeck(){
  p1 = Card.updateMany({Player: {$regex: `^(?!.*In Deck)`}},
  {$set: {Player: "In Deck"}})
  .catch((err) => {
    console.log(err)
  })
}

app.get("get/hand/", (res,req) => {
    currentUser = req.cookies.login.username

    var retvalplayer = 0;
    let p2 = Card.find({Player: currentUser}).exec()
    p2.then((doc) =>{
      for(i in doc){
        console.log(doc)
        retvalplayer = retvalplayer + doc[i].Value
        
      }
      res.end(currentUser+": "+ retvalplayer)
      })
    p2.catch((err) => {
      console.log(err)
    })
    })


function deal(currentUser){
    for(let i = 0; i <= 1; i++){
    let randomNumber = Math.floor(Math.random() * deck.length);
    //console.log(deck.length);
    Card.updateOne(
    { _id: deck[randomNumber]},
    { $set: { Player: currentUser } })
    .then((results) => {
      //console.log(results)
      deck.splice(randomNumber, 1);
    })
    .catch((error) => {
      console.log(error);
    });
  }
}




//(POST) Should add a user to the database. The username and
// password should be sent as POST parameter(s).

app.post('/hit/card/:Username', (req, res) => {
  let getuser = req.cookies.login.username
   var newItem = new Item( {
    title: req.body.title,
    description: req.body.desc,
    image: req.file.filename,
    stat: req.body.stat
  });
  let p =newItem.save()
  p.then((doc) =>{
      if (doc.stat.toLowerCase() == "sale"){
      let p2 = User.findOneAndUpdate({username:getuser}, 
        {$push: {listings: doc._id}});
        p2.catch( (err) => { 
          console.log(err);});}
      if (doc.stat.toLowerCase() == "sold"){
        let p2 = User.findOneAndUpdate({username:getuser}, 
          {$push: {purchases: doc._id}});
          p2.catch( (err) => { 
            console.log(err);
            res.end('FAIL')});}
    }).then((results) => {
      return res.redirect("/home.html")
  })
  });

 // Will login the user and return a text. 
 // If the username is valid it will return Login, 
 // else it will return Login Failed.
  app.post('/account/login/', (req, res) => {
    var { u, p} = req.body;
    let p1 = User.find({username: u, password: p})
    p1.then((doc) => {
      if (doc.length > 0 ){
        let id = addSession(u)
        res.cookie('login', {username: u, sid: id}, {maxAge: 300000000});
        
        res.send("LOGIN");
      }else{
        res.end("Login Failed")
      } 
    });
  });
 

 
 
  // (POST) Should add an item to the database.
  // The items information (title, description, image, price, status) 
  //should be included as POST parameters. The item should be added the
  // USERNAMEs list of listings.  
  app.post('/add/user/', (req, res) => {
    let p = User.find({username: req.body.username}).exec()
    .then((doc) => {
        console.log(doc.length)
      if(doc.length == 0){
    var newUser = new User({
        username: req.body.username,
        password: req.body.password,
        balance: 1000,
        roundsPlayed: 0,
        Wins: 0,
        Losses: 0,
        Ties: 0
    });
  
    let p1 = newUser.save();
    p1.then((doc) => {
      res.end('Created new Account!');
    });
    p1.catch((err) => {
      console.log(err)
      res.end("Failed")
    });
  }else{
    res.end("Username Taken")
  }});
  });
const port = 80;
app.listen(port, () => {
  console.log('server has started');
});

app.get('/get/user', (req, res) => {
  if(req.cookies && req.cookies.login ){
    let p = User.find({username: req.cookies.login.username}).exec()
    .then((doc) => {
        res.end(JSON.stringify(doc[0]));
  })}
});
