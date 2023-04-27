
// Connect to server

var socket = io();

var username
var roomid
var bidamt
var type

const el = document.getElementById('login')
if (el){
el.addEventListener('click', () => {
  console.log("YES2")
  var user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  let data = { u: user, p: pass };
  username = user
  socket.emit('login', data);
})}

socket.on("loginResponse", (text) => {
    if (text == 'LOGIN') {
      window.location.href = '/home.html'
    } else {
      let retval = document.getElementById("error")
      retval.innerText = text;
      }
    });





// Will get the currents users name.
 socket.on("getUser", (text) => 
 {
      console.log(text)
      usernameNav = document.getElementById("Welcome");
      if (usernameNav) {
        usernameNav.innerText = "Welcome " + text.username + "!";
      }
      currentUser = text.username
      usernameNav = document.getElementById("usernamePara");
      usernameNav.innerText = text.username;
      bal = document.getElementById("balancePara");
      bal.innerText = "Balance: " + text.balance;
      rounds = document.getElementById("rounds");
      rounds.innerText = "Rounds Played: " + text.roundsPlayed;
      wins = document.getElementById("wins");
      wins.innerText = "Wins: " + text.Wins;
      losses = document.getElementById("loss");
      losses.innerText = "Losses: " + text.Losses;
      Ties = document.getElementById("ties");
      Ties.innerText = "Ties: " + text.Ties;

    })


document.getElementById('singlerplayermode').addEventListener('click', () => {
  window.location.href = '/singleGame.html'
  roomid = username
  type = "singleplayer"
  socket.emit('joinRoom',{username,roomid,bidamt,type});
})

document.getElementById('multiplayermode').addEventListener('click', () => {
  window.location.href = '/mode.html'
  roomid = username
  type = "multiplayer"
  socket.emit('joinRoom',{username,roomid,bidamt,type});
})
  

document.getElementById('exit').addEventListener('click', () => {
  window.location.href = '/home.html'

})

document.getElementById('signup').addEventListener('click', () => {
   window.location.href = '/index.html'
 
})
 




function startGame()
{
  socket.emit('startGame',{username,roomid,type});
}



//Join ChatRoom



//Get room and Users
socket.on('roomUsers',({roomid,users})=>
{
  console.log(roomid,users);
    outputRoomName(roomid);
    outputUsers(users);

})
//Add RoomName to DOM
function outputRoomName(roomid)
{
  $('#roomid').html('Room ID: <span style="color:brown;">'+roomid+'</span>');
}

//Add Users to DOM
// //function outputUsers(users)
// {
//   let content='<li class="list-group-item active">Users</li>';
//   content+=`
//   ${users.map(user =>
//     `<li class="list-group-item d-flex justify-content-between align-items-center">${user.username}
//     <span class="badge badge-primary badge-pill">${user.bidamt}</span>
//     </li>`).join('')}`;
//   $('.list-group').html(content);
// }

//Message from Server
// socket.on('message',(message)=>
// {
//     console.log(message);
// })






//Game Play
var hand = [''];
var x = 0;
//Game Start Socket Listen
socket.on('gameStarted',function()
{
  if(type==1)
  {
    for(var x = 0; x < 20; x++)
     {
      socket.emit('deal-dealer');
     }
    socket.emit('test-dealer-score');
  }

   $('.waiting').remove();
  the_reveal.show();

})



// socket.on('list-of-users', function(data) {
//   console.log(data);
//   var player_list = '';
//   $('#players').html('');
//   for(var i = 0; i < data.length; i++) {
//     player_list += '<b>' + data[i].name + ' </b>';
//     if(i!==data.length-1)player_list+=", ";
//   }
//   $('#players').html(player_list);
// });



socket.on('score', function(data) {
  $('#score').html('');
  $('#score').html('Your score: '+data);
  if (data > 21) {
    $('#score').html('');
    $('#score').html('Your score: '+data + ' <b> bust!</b>');
    $('#stand').trigger('click');
  }
  if (data == 21) {
    $('#score').html('Your score: '+data + ' <b>BlackJack!</b>');
    $('#stand').trigger('click');
  }
});


socket.on('d_score', function(data) {
  $('#d_score').html('');
  $('#d_score').html('Dealer score: '+data);
  if (data > 21) {
    $('#d_score').html('');
    $('#d_score').html('Dealer score: '+ data + ' <b>bust!</b>');
  }
  if (data == 21) {
    $('#d_score').html('Dealer score: '+data + ' <b>BlackJack!</b>');
  }
});


//User Clicks Stand Button
document.getElementById('stand-button').addEventListener('click', () => {
  socket.emit('stand-button');
});



socket.on('empty-deck', function() {
  $('#winner').html('<b>There are no more cards available...(52 used) Restart the server</b>')
});


socket.on('dealer-won',function(data){
  $('#winner').html("The <b>Dealer</b> has won <b> $"+data+"</b> 🎉");
})


socket.on('winner', function(data) {
  var winner = data;
  $('#winner').html('');
  if (data == 'dealer') {
    $('#d_score').show();
    winner = 'The <b>Dealer</b> has won 🎉'
    $('#winner').append(winner);
  }
  else {
    $('#d_score').show();
    winner = '<b>' +data +' </b> wins with the best hand!'
    $('#winner').append(winner);
  }
});



socket.on('yourBet',function(data){
    if(socket.id == data.user.socket){
      let bet;
      if(data.bet>0)
       bet='Congrats '+data.user.name+', you have won <b>$'+data.bet+'</b> in this game! 🎉';
       else
       bet="Sorry "+data.user.name+", you have lost the bet of <b>$"+(data.bet*-1)+"</b> 😞";
      $("#user").html(bet);
    }
})



//User Btn Handler
socket.on('user-turn', function(turn) {
  if (turn == false) {
    $('#hit').prop("disabled", true);
    $('#stand').prop("disabled", true);
    console.log('buttons disabled');
  }
  if (turn == true) {
    $('#hit').prop("disabled", false);
    $('#stand').prop("disabled", false);
    console.log('buttons enabled');
  }
});




socket.on('make-dealer-card', function(data) {
  make_dealer_card(data.suit, data.rank);
});



let count=0;
function make_dealer_card(suit, rank) {
  var card = document.getElementById("dealerCard");
  var img=document.createElement("img");
  img.id="img"+(count++);
  img.className="small";
  if(suit==="diams")suit="diamonds";
  img.setAttribute("src",'images/Playing-Cards/'+rank+'_of_'+suit+'.png');
  console.log("Dealer got "+suit+rank);
  card.appendChild(img);
}

socket.on('hide-dealer-hand', function() {
 for(let y=1;y<count;y++) $('#img'+y).hide();
 $("#d_score").hide();
});



socket.on('show-dealer-hand', function() {
  for(let y=0;y<count;y++) $('#img'+y).show();
  $("#d_score").show();
 });



$('#hit').click(function() {
  console.log("click on hit button by ",username)
  socket.emit('hit');
});



socket.on('make-card', function(data) {
  make_card(data.suit, data.rank);
});



function make_card(suit, rank) {
  var card = document.getElementById("player");
  var img=document.createElement("img");
  img.className="small";
  if(suit==="diams")suit="diamonds";
  img.setAttribute("src",'images/Playing-Cards/'+rank+'_of_'+suit+'.png');
  console.log("Player got "+suit+rank);
  card.appendChild(img);
}

function createUser() {
  let n = document.getElementById('username').value;
  let pw = document.getElementById('password').value;
  let url = '/add/user/';
  let data = { username: n, password: pw };
  let p = fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  p.then((data) => {
    return data.text();
  }).then((text) => {
    if (text == "Created new Account!") {
      alert(text)
      window.location.href = 'index.html'
    } else {
      alert(text);
    }
  });
}



// hands = {}
// function start() {
//   document.getElementById("startButton").disabled = true;
//   document.getElementById("betinput").disabled = true;
//   document.getElementById("stayButton").disabled = false;
//   document.getElementById("hitButton").disabled = false;
//   curBet = document.getElementById("betinput").value;
//   if (curBet == "" || curBet <= 0) {
//     alert("Invalid bet amount.")
//   }
//   else {
//     //document.getElementById("betinput").isContentEditable(false);
//     //document.getElementById("dealerhand") = "";
//     gameInSession = true;
//     fetch('/start/deal/')
//       .then((result) => {
//         url = '/get/user'
//         fetch(url)
//           .then((results) => {
//             return results.json();
//           })

//           .then((text) => {
//             document.getElementById("dealerhand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/cardback.jpeg">'
//             var final = ''
//             //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
//             count = 0;
//             bjString = "";
//             for (c in text.CurrentHand) {
//               bjString += text.CurrentHand[c].Suit.toLowerCase();
//               console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
//               final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
//               count += 1;
//               if (count == 2) {
//                 if (text.Total == 21) {
//                   gameInSession = false;
//                   current = document.getElementById("currenthand");
//                   current.innerHTML = final;
//                   setTimeout(showCards("Blackjack! You win."), 15000)
//                   updatePlayer("won");
//                   return "";
//                 }
//                 else {
//                   return final;
//                 }
                
//               }
//             }
//             //return final;
//           }).then((docChange) => {
//             if (docChange != "") {
//               console.log(docChange)
//             current = document.getElementById("currenthand");
//             current.innerHTML = docChange;
//             }
            
//           }
//           ).catch((err) => {
//             console.log(err);
//           })
//       })
//   }
// }

// currentTotal = 0;
// function hit() {
//   if (gameInSession) {

//     currentTotal = 0;
//     fetch('/hit/card/')
//       .then((result) => {
//         console.log(result);
//         url = '/get/user'
//         fetch(url)
//           .then((results) => {
//             console.log("yes")
//             return results.json();
//           })

//           .then((text) => {
//             console.log(text);

//             var final = ''
//             //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
//             for (c in text.CurrentHand) {
//               console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
//               final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
//               currentTotal += text.CurrentHand[c].Value
//             }
//             console.log(final)
//             current = document.getElementById("currenthand");
//             current.innerHTML = final
//           }).then(() => {
//             if (currentTotal > 21) {
//               gameInSession = false;
//               showCards("You busted.");
//               updatePlayer("lost");
//             }
//           })

//       })
//   }
// }


// function updatePlayer(outcome) {
//   url = '/get/user'
//   fetch(url)
//     .then((results) => {
//       console.log("yes")
//       return results.json();
//     })
//     .then((text) => {
//       console.log(text);
//       let newBal = Number(text.balance);
//       let newRounds = text.roundsPlayed + 1;
//       let newWins = text.Wins;
//       let newLosses = text.Losses;
//       let newTies = text.Ties;
//       if (outcome == "lost") {
//         newBal -= Number(curBet);
//         newLosses += 1;
//       }
//       else if (outcome == "won") {
//         newBal += Number(curBet);
//         newBal * 1;
//         newWins += 1;
//       }
//       else if (outcome == "tied") {
//         newTies += 1
//       }
//       let data = { balance: newBal, roundsPlayed: newRounds, Wins: newWins, Losses: newLosses, Ties: newTies };
//       console.log(data);
//       let p = fetch('/update/player', {
//         method: 'POST',
//         body: JSON.stringify(data),
//         headers: { "Content-Type": "application/json" }
//       });
//       p.then((data) => {
//         return data.text();
//       }).then((text) => {
//         console.log(text);
//       });
//     })
// }


// DealercurrentTotal = 0;
// function stay() {
//   if (gameInSession) {
//     showCards("");
//     document.getElementById("stayButton").disabled = true;
//     document.getElementById("hitButton").disabled = true;
//     setTimeout(() => {
//       keepGoing = true;
//       // while (keepGoing) {
//       let url = '/turn/dealer/'
//       currentTotal = 0;
//       fetch('/get/dealer/')
//         .then((results) => {
//           return results.text();
//         })
//         .then((text) => {
//           //   var final = ''
//           //   //<img class = "card" src="img/aceclubs.png" alt="My Image"></img>
//           //   for( c in text.CurrentHand){
//           //     console.log(text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Value+".png")
//           //     final +='<img class = "card" src="img/'+text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Name.toLowerCase()+".png"+'" alt="My Image"></img>'
//           //     currentTotal += text.CurrentHand[c].Value 
//           //   }
//           //   console.log(final)
//           //   current = document.getElementById("dealerhand");
//           //   current.innerHTML = final;
//           //   return;
//           // }).then(() => {
//           fetch(url)
//             .then((response) => {
//               //showCards();
//               console.log(response);
//               return response.text()
//             })
//             .then((text) => {
//               console.log(text);
//               if (text == "BUST") {
//                 gameInSession = false;
//                 keepGoing = false;
//                 showCards("Dealer Busted. You Won.")
//                 updatePlayer("won")
//                 //alert("Dealer Busted. You Win")

//               }
//               if (text == "DEALER") {
//                 gameInSession = false;
//                 keepGoing = false;
//                 showCards("Dealer won.")
//                 updatePlayer("lost")
//                 //alert("Dealer Won.")

//               }
//               if (text == "PLAYER") {
//                 gameInSession = false;
//                 keepGoing = false;
//                 showCards("You won.")
//                 updatePlayer("won")
//                 //alert("You win")

//               }
//               if (text == "TIE") {
//                 gameInSession = false;
//                 keepGoing = false;
//                 showCards("Tied.")
//                 updatePlayer("tied")
//                 //alert("Tied.")

//               }
//               if (text == "true") {
//                 showCards("")
//                 gameInSession = true;
//                 keepGoing = true;
//               }
//               return keepGoing;
//             }).then((bool) => {
//               if (bool) {
//                 stay();
//               }
//             })
//         })

//     }, 1500)
//   }
// }


// function showCards(message) {
//   currentTotal = 0;
//   fetch('/get/dealer/')
//     .then((results) => {
//       return results.json();
//     })
//     .then((text) => {
//       var final = ''
//       //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
//       for (c in text.CurrentHand) {
//         console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
//         final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
//         currentTotal += text.CurrentHand[c].Value
//       }
//       console.log(final)
//       current = document.getElementById("dealerhand");
//       if (current.innerHTML != final && final != "") {
//         current.innerHTML = final
//         if (message != "") {
//           document.getElementById("startButton").disabled = false;
//           document.getElementById("betinput").disabled = false;
//           document.getElementById("stayButton").disabled = true;
//           document.getElementById("hitButton").disabled = true;
//           alert(message + " Updated stats.");
//         }
//       }
//     }).then(() => {
//     })

// }

function clearCardDisplay() {
  document.getElementById("currentHand").innerHTML = "";
  document.getElementById("dealerhand") = "";
}

function exit() {
  window.location.href = './home.html';
}

function signOut() {
  window.location.href = './index.html';
  // Erase cookies and session!!!
}

function randomRoom() {
  window.location.href = './waitingRandom.html'
}

function createRoom() {
  window.location.href = './waitingCustom.html'
}

function joinRoom() {
  code = document.getElementById('code');
  if (code.value) {
    // and if code exists
    window.location.href = 'waitingCustom.html'
  }

}