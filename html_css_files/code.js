
gameInSession = false;
curBet = 0;
document.getElementById("stayButton")

currentUser = ''
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


function login() {
  var user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  let data = { u: user, p: pass };
  currentUser = data.u
  let url = '/account/login/'
  let p = fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  p.then((data) => {
    return data.text();
  })
    .then((text) => {

      if (text == 'LOGIN') {
        window.location.href = '/home.html'
      } else {
        alert(text)
      }

    });
}



//This function will send the post to create the item
// This function will be called when the ADD ITEM button is
// pressed. 
function additems() {
  let n = document.getElementById('title').value;
  let d = document.getElementById('description').value;
  let i = document.getElementById('image').value;
  let p = document.getElementById('price').value;
  let s = "SALE"
  let url = '/add/item/' + currentUser;
  let data = { title: n, description: d, image: i, price: p, stat: s };
  let p1 = fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  p1.catch(() => {
    alert('something went wrong');
  });
}







// Will get the currents users name.
function getUser() {
  url = '/get/user'
  fetch(url)
    .then((results) => {
      return results.json();
    })
    .then((text) => {
      //console.log(text)
      currentUser = text.username
      usernameNav = document.getElementById("Welcome");
      if (usernameNav) {
        usernameNav.innerText = "Welcome " + text.username + "!";
      }
      usernamePara = document.getElementById("usernamePara");
      if (usernamePara) {
        usernamePara.innerText = text.username;
      }
      bal = document.getElementById("balancePara");
      if (bal) {
        bal.innerText = "Balance: " + text.balance;
      }
      rounds = document.getElementById("rounds");
      if (rounds) {
        rounds.innerText = "Rounds Played: " + text.roundsPlayed;
      }
      wins = document.getElementById("wins");
      if (wins) {
        wins.innerText = "Wins: " + text.Wins;
      }
      losses = document.getElementById("loss");
      if (losses) {
        losses.innerText = "Losses: " + text.Losses;
      }
      Ties = document.getElementById("ties");
      if (Ties) {
        Ties.innerText = "Ties: " + text.Ties;
      }
      unWaiting = document.getElementById("usernameWaiting");
      if (unWaiting) {
        unWaiting.innerText = text.username;
      }


    })
}

function singlePlayer() {
  window.location.href = '/singleGame.html'
}

function multiPlayer() {
  window.location.href = '/mode.html'
}

function exit() {
  window.location.href = '/home.html'
}

function signout() {
  window.location.href = '/index.html'
}

hands = {}
function start() {
  curBet = document.getElementById("betinput").value;
  fetch('/get/user')
    .then((results) => {
      return results.json();
    }).then((text) => {
      return text.balance
    }).then((curBal) => {
      if (curBet == "" || curBet <= 0) {
        alert("Invalid bet amount.")
      }
      else if (curBet > curBal) {
        alert('Your balance is too low for that bet.')
      }
      else {
        document.getElementById("startButton").disabled = true;
        document.getElementById("betinput").disabled = true;
        document.getElementById("stayButton").disabled = false;
        document.getElementById("hitButton").disabled = false;
        //document.getElementById("betinput").isContentEditable(false);
        //document.getElementById("dealerhand") = "";
        gameInSession = true;
        fetch('/start/deal/')
          .then((result) => {
            url = '/get/user'
            fetch(url)
              .then((results) => {
                return results.json();
              })

              .then((text) => {
                document.getElementById("dealerTotal").innerHTML = '';
                document.getElementById("dealerhand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/cardback.jpeg">'
                var final = ''
                //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
                count = 0;
                bjString = "";
                for (c in text.CurrentHand) {
                  bjString += text.CurrentHand[c].Suit.toLowerCase();
                  //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
                  final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
                  count += 1;
                  if (count == 2) {

                    if (text.Total == 21) {
                      gameInSession = false;
                      current = document.getElementById("currenthand");
                      current.innerHTML = final;
                      document.getElementById("totalDetails").innerHTML = 'Total: ' + text.Total;
                      setTimeout(showCards("Blackjack! You win."), 15000)
                      updatePlayer("won");
                      return final;
                    }
                    else {
                      document.getElementById("totalDetails").innerHTML = 'Total: ' + text.Total;
                      return final;
                    }
                  }
                }
                //return final;
              }).then((docChange) => {
                if (docChange != "") {
                  //console.log(docChange)
                  current = document.getElementById("currenthand");
                  current.innerHTML = docChange;
                  //console.log(text.Total)
                }
              }).then(() => {

              }).catch((err) => {
                console.log(err);
              })
          })
      }
    })

}

currentTotal = 0;
function hit() {
  if (gameInSession) {
    currentTotal = 0;
    fetch('/hit/card/')
      .then((result) => {
        //console.log(result);
        url = '/get/user'
        fetch(url).then((results) => {
          console.log("hitting user")
          return results.json();
        }).then((text) => {
          //console.log(text);
          var final = ''
          //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
          for (c in text.CurrentHand) {
            //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
            final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
            currentTotal += text.CurrentHand[c].Value
          }
          //console.log(final)
          current = document.getElementById("currenthand");
          current.innerHTML = final
          document.getElementById("totalDetails").innerHTML = 'Total: ' + text.Total;
        }).then(() => {
          if (currentTotal > 21) {
            fetch('/check/ace/').then((result) => {
              //console.log(result)
              return result.json()
            }).then((text2) => {
              //console.log(text2)
              //console.log(text2.Total);
              if (text2.Total > 21) {

                gameInSession = false;
                showCards("You busted.");
                updatePlayer("lost");
              }
              else {
                document.getElementById("totalDetails").innerHTML = 'Total: ' + text2.Total;
              }
            })
          }
        })
      })
  }
}


function updatePlayer(outcome) {
  url = '/get/user'
  fetch(url)
    .then((results) => {
      //console.log("yes")
      return results.json();
    })
    .then((text) => {
      //console.log(text);
      let newBal = Number(text.balance);
      let newRounds = text.roundsPlayed + 1;
      let newWins = text.Wins;
      let newLosses = text.Losses;
      let newTies = text.Ties;
      if (outcome == "lost") {
        newBal -= Number(curBet);
        newLosses += 1;
      }
      else if (outcome == "won") {
        newBal += Number(curBet);
        newBal * 1;
        newWins += 1;
      }
      else if (outcome == "tied") {
        newTies += 1
      }
      let data = { balance: newBal, roundsPlayed: newRounds, Wins: newWins, Losses: newLosses, Ties: newTies };
      //console.log(data);
      let p = fetch('/update/player', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      p.then((data) => {
        return data.text();
      }).then((text) => {
        getUser();
        //console.log(text);
      });
    })
}


DealercurrentTotal = 0;
function stay() {
  if (gameInSession) {
    showCards("");
    document.getElementById("stayButton").disabled = true;
    document.getElementById("hitButton").disabled = true;
    keepGoing = true;
    currentTotal = 0;
    fetch('/get/dealer/')
      .then((results) => {
        return results.text();
      })
      .then((text) => {
        setTimeout(() => {
          fetch('/turn/dealer/')
            .then((response) => {
              return response.text()
            })
            .then((doctext) => {
              var text = doctext;
              fetch('/get/dealer/').then((results) => {
                return results.json();
              }).then((dealerRes) => {
                document.getElementById("dealerTotal").innerHTML = "Total: " + dealerRes.Total;
                console.log(text);
                if (text == "BUST") {
                  gameInSession = false;
                  keepGoing = false;
                  showCards("Dealer Busted. You Won.")
                  updatePlayer("won")
                  //alert("Dealer Busted. You Win")

                }
                if (text == "DEALER") {
                  gameInSession = false;
                  keepGoing = false;
                  showCards("Dealer won.")
                  updatePlayer("lost")
                  //alert("Dealer Won.")

                }
                if (text == "PLAYER") {
                  gameInSession = false;
                  keepGoing = false;
                  showCards("You won.")
                  updatePlayer("won")
                  //alert("You win")

                }
                if (text == "TIE") {
                  gameInSession = false;
                  keepGoing = false;
                  showCards("Tied.")
                  updatePlayer("tied")
                  //alert("Tied.")

                }
                if (text == "true") {
                  showCards("")
                  gameInSession = true;
                  keepGoing = true;
                }
                return keepGoing;
              }).then((bool) => {
                if (bool) {
                  stay();
                }
              })
            })

        }, 1500)
      })
  }
}

function showCards(message) {
  currentTotal = 0;
  fetch('/get/dealer/')
    .then((results) => {
      return results.json();
    })
    .then((text) => {
      var final = ''
      //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
      for (c in text.CurrentHand) {
        //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
        final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
        currentTotal += text.CurrentHand[c].Value
      }
      //console.log(final)
      current = document.getElementById("dealerhand");
      document.getElementById("dealerTotal").innerHTML = 'Total: ' + text.Total;
      if (current.innerHTML != final && final != "") {
        current.innerHTML = final
        if (message != "") {
          document.getElementById("startButton").disabled = false;
          document.getElementById("betinput").disabled = false;
          document.getElementById("stayButton").disabled = true;
          document.getElementById("hitButton").disabled = true;
          alert(message + " Updated stats.");
        }
      }
    }).then(() => {
    })
}

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
  thisCode = document.getElementById('code').value;
  if (thisCode != "") {
    fetch('/get/user')
      .then((results) => {
        //console.log("yes")
        return results.json();
      })
      .then((user) => {
        let url = '/enter/code/room';
        let data = { username: user.username, code: thisCode };
        let p = fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" }
        });
        p.then((data) => {
          return data.text();
        }).then((text) => {
          if (text == "Success") {
            alert(text)
            window.location.href = 'waitingCustomJoined.html'
            document.getElementById("enterGameButton").disabled = true;
          } else if (text == "Invalid Code") {
            alert(text);
          }
          setInterval(updateWaiting, 3000)
        });
      })
    // and if code exists
  }

}

function joinedByCode() {
  getUser();
  setInterval(sillyLittleAnimation, 1000);
  setInterval(updateWaiting, 3000)
}

function randomWaiting() {
  getUser();
  setInterval(sillyLittleAnimation, 1000);
  randomGame();
}

function sillyLittleAnimation() {
  x = document.getElementById("waitingLine").innerText;
  if (x == "Waiting for players") {
    document.getElementById("waitingLine").innerText = "Waiting for players."
  }
  else if (x == "Waiting for players.") {
    document.getElementById("waitingLine").innerText = "Waiting for players.."
  }
  else if (x == "Waiting for players..") {
    document.getElementById("waitingLine").innerText = "Waiting for players..."
  }
  else if (x == "Waiting for players...") {
    document.getElementById("waitingLine").innerText = "Waiting for players"
  }
}

function randomGame() {
  fetch('/get/user')
    .then((results) => {
      //console.log("yes")
      return results.json();
    })
    .then((user) => {
      let url = '/new/random/game';
      let data = { username: user.username };
      let p = fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      p.then((data) => {
        return data.text();
      }).then((text) => {
        if (text == "Added") {
          alert(text)
        } else if (text == "Created") {
          alert(text);
        }
        setInterval(updateWaiting, 3000)
      });
    })
}

function updateWaiting() {
  fetch('/waiting/players/').then((result) => {
    return result.json()
  }).then((results) => {
    if (results[0]) {
      console.log(results)
      players = results[0].Players;
      fetch('/get/user')
        .then((results) => {
          //console.log("yes")
          return results.json();
        })
        .then((user) => {
          if (players.length == 1) {
            console.log('in 1')
            return false;
          }
          if (players.length == 2) {
            console.log('in 2')
            // if (players[0] == user.username) {
            document.getElementById("usernameWaiting").innerText = players[0]
            document.getElementById("p2").innerText = players[1]
            // } else {
            //   document.getElementById("p2").innerText = players[0]
            //}
            return false;
          }
          if (players.length == 3) {
            console.log('in 3')
            // if (players[0] == user.username) {
            document.getElementById("usernameWaiting").innerText = players[0]
            document.getElementById("p2").innerText = players[1]
            document.getElementById("p3").innerText = players[2]

            // } else if (players[1] == user.username) {
            //   document.getElementById("p2").innerText = players[0]
            //   document.getElementById("p3").innerText = players[2]
            // } else if (players[2] == user.username) {
            //   document.getElementById("p2").innerText = players[0]
            //   document.getElementById("p3").innerText = players[1]
            // }
            return true;
          }
        }).then((bool) => {
          console.log(bool)
          if (bool) {
            canGameStart();
          }
          else {
            return
          }
        })
    }
  })
}

function canGameStart() {
  console.log('checking game ready')
  fetch('/is/game/ready/').then((results) => {
    console.log(results)
    return results.text();
  }).then((text) => {
    if (text == "true") {
      console.log('game is starting')
      alert("Your game is about to begin.")
      window.location.href = './multiGame.html'
    }
  })
}

function createWaiting() {
  getUser();
  setInterval(sillyLittleAnimation, 1000);
  codeGame();
}

function codeGame() {
  fetch('/get/user')
    .then((results) => {
      //console.log("yes")
      return results.json();
    })
    .then((user) => {
      let url = '/new/code/game';
      let data = { username: user.username };
      let p = fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      p.then((data) => {
        return data.text();
      }).then((text) => {
        if (text.length == 6) {
          document.getElementById("codeDisplay").innerText = text;
          alert('You successfully created a waiting room. Share the code below to have your friends join!')

        }
        setInterval(updateWaiting, 3000)
      });
    })
}

function multiGame() {
  getUser();
  setNamesInGameRoom();
}

function setNamesInGameRoom() {
  fetch('/waiting/players/').then((result) => {
    return result.json()
  }).then((results) => {
    players = results[0].Players;
    fetch('/get/user')
      .then((result) => {
        return result.json();
      })
      .then((user) => {
        console.log(user)
        console.log(players)
        if (players[0] == user.username) {
          document.getElementById("player3Details").innerText = "You";
          document.getElementById("player2Details").innerText = players[1];
          document.getElementById("player1Details").innerText = players[2];
        }
        else if (players[1] == user.username) {
          document.getElementById("player3Details").innerText = players[0];
          document.getElementById("player2Details").innerText = "You";
          document.getElementById("player1Details").innerText = players[2];
        }
        else if (players[2] == user.username) {
          document.getElementById("player3Details").innerText = players[0];
          document.getElementById("player2Details").innerText = players[1];
          document.getElementById("player1Details").innerText = "You";
        }
      })
  })
}

function startMulti() {
  curBet = document.getElementById("betinput").value;
  fetch('/get/user').then((results) => {
    return results.json();
  }).then((text) => {
    return text.balance
  }).then((curBal) => {
    if (curBet == "" || curBet <= 0) {
      alert("Invalid bet amount.")
    }
    else if (curBet > curBal) {
      alert('Your balance is too low for that bet.')
    }
    else {
      document.getElementById("startButton").disabled = true;
      document.getElementById("betinput").disabled = true;
      gameInSession = true;
      fetch('/player/ready/', {
        method: 'POST',
        headers: { "Content-Type": "application/json" }
      })
        .then((data) => {
          return data.text();
        }).then((text) => {
          console.log(text)
          if (text == "Okay") {
            interval = setInterval(checkGameStart, 3000)
          }
        });
    }
  })
}

function checkGameStart() {
  console.log('here')
  fetch('/are/cards/dealt').then((results) => {
    return results.json();
  }).then((result) => {
    console.log(result)
    if (result.Hands.length >= 8) {
      clearInterval(interval)
      showEveryCard(result)
    }
  })
}

function showEveryCard(game) {
  players = game.Players;
  cards = game.Hands;
  turn = game.Turn;
  document.getElementById("dealerhand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/cardback.jpeg">'
  fetch('/get/user').then((userRes) => {
    return userRes.json()
  }).then((user) => {
    if (players[0] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/' + cards[0].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';

      // if (turn == user.username) {
      //   document.getElementById("stayButton").disabled = false;
      //   document.getElementById("hitButton").disabled = false;
      // }
    }
    else if (players[1] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/' + cards[1].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';
    }
    else if (players[2] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/' + cards[2].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';
    }
    turnInterval = setInterval(frequentUpdate, 1000)
    if (game.Turn == user.username) {
      document.getElementById("stayButton").disabled = false;
      document.getElementById("hitButton").disabled = false;
    }
  }).then(() => {

  })
}
var rand1 = 0;
var rand2 = 0;
function hitMulti() {
  if (gameInSession) {
    currentTotal = 0;
    fetch('/hit/card/multi/')
      .then((result) => {
        //console.log(result);
        url = '/get/user'
        fetch(url).then((results) => {
          console.log("hitting user")
          return results.json();
        }).then((text) => {
          //console.log(text);
          var final = ''
          //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
          for (c in text.CurrentHand) {
            //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
            final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
            currentTotal += text.CurrentHand[c].Value
          }
          //console.log(final)
          if (players[0] == text.username) {
            document.getElementById("3hand").innerHTML = final;
          }
          else if (players[1] == text.username) {
            document.getElementById("2hand").innerHTML = final;
          }
          else if (players[2] == text.username) {
            document.getElementById("1hand").innerHTML = final;
          }
          //document.getElementById("totalDetails").innerHTML = 'Total: ' + text.Total;
        }).then(() => {
          if (currentTotal > 21) {
            fetch('/check/ace/').then((result) => {
              //console.log(result)
              return result.json()
            }).then((text2) => {
              //console.log(text2)
              //console.log(text2.Total);
              if (text2.Total > 21) {
                gameInSession = false;
                bustedMulti("You busted. Keep watching to see the dealer's cards.");
                updatePlayer("lost");
              }
              else {
                //document.getElementById("totalDetails").innerHTML = 'Total: ' + text2.Total;
              }
            })
          }
        })
      })
  }
}

function bustedMulti(message) {
  alert(message)
  rand1 = 0;
  rand2 = 0
  document.getElementById("stayButton").disabled = true;
  document.getElementById("hitButton").disabled = true;
  fetch('/switch/turn')
}

function stayMulti() {
  fetch('/switch/turn')
  rand1 = 0;
  rand2 = 0
  document.getElementById("stayButton").disabled = true;
  document.getElementById("hitButton").disabled = true;
}

frequentCount = 0
function frequentUpdate() {
  console.log('checking if its my turn')
  fetch('/is/it/my/turn/yet/').then((results) => {
    return results.text()
  }).then((result) => {
    if (frequentCount == 0) {
      updateInterval = setInterval(updateOtherUserCards, 3000)
      frequentCount++
    }
    if (result == "true") {
      document.getElementById("stayButton").disabled = false;
      document.getElementById("hitButton").disabled = false;
      clearInterval(turnInterval)
    }
  })
}

function updateOtherUserCards() {
  fetch('/get/user').then((userRes) => {
    return userRes.json()
  }).then((user) => {
    fetch('/update/my/screen/').then((result) => {
      return result.json()
    }).then((results) => {
      p3 = results.Players[0];
      p2 = results.Players[1];
      p1 = results.Players[2];
      threeHand = '<img class = "card" src="img/cardback.jpeg">'
      twoHand = '<img class = "card" src="img/cardback.jpeg">'
      oneHand = '<img class = "card" src="img/cardback.jpeg">'
      for (let c = 4; c < results.Hands.length; c++) {
        line = results.Hands[c].split(" ");
        if (line[0] == p3) {
          threeHand += '<img class = "card" src="img/' + line[1] + '.png">';
        }
        else if (line[0] == p2) {
          twoHand += '<img class = "card" src="img/' + line[1] + '.png">';
        }
        else if (line[0] == p1) {
          oneHand += '<img class = "card" src="img/' + line[1] + '.png">';
        }
        if (c == results.Hands.length - 1) {
          if (results.Players[0] == user.username) {
            if (document.getElementById("2hand").innerHTML != twoHand) {
              document.getElementById("2hand").innerHTML = twoHand;
            }
            if (document.getElementById("1hand").innerHTML != oneHand) {
              document.getElementById("1hand").innerHTML = oneHand;
            }
          } else if (results.Players[1] == user.username) {
            if (document.getElementById("3hand").innerHTML != threeHand) {
              document.getElementById("3hand").innerHTML = threeHand;
            }
            if (document.getElementById("1hand").innerHTML != oneHand) {
              document.getElementById("1hand").innerHTML = oneHand;
            }
          } else if (results.Players[2] == user.username) {
            if (document.getElementById("3hand").innerHTML != threeHand) {
              document.getElementById("3hand").innerHTML = threeHand;
            }
            if (document.getElementById("2hand").innerHTML != twoHand) {
              document.getElementById("2hand").innerHTML = twoHand;
            }
          }
        }
      }

      if (results.Turn == "Dealer") {
        // clearInterval(updateInterval)
        if (rand1 == 0) {
          initialShowDealer();
          clearInterval(updateInterval)
        }
        rand1++
      }
    })
  })
}

function initialShowDealer() {
  fetch('/get/dealer/multi').then((result) => {
    return result.json()
  }).then((text) => {
    var final = ''
    //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
    for (c in text.CurrentHand) {
      //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
      final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
      currentTotal += text.CurrentHand[c].Value
    }
    //console.log(final)
    current = document.getElementById("dealerhand");
    //document.getElementById("dealerTotal").innerHTML = 'Total: ' + text.Total;
    if (current.innerHTML != final && final != "") {
      current.innerHTML = final
      // if (message != "") {
      //   document.getElementById("startButton").disabled = false;
      //   document.getElementById("betinput").disabled = false;
      //   document.getElementById("stayButton").disabled = true;
      //   document.getElementById("hitButton").disabled = true;
      //   alert(message + " Updated stats.");
      // }
    }
  }).then(() => {
    fetch('/ready/for/dealer').then((result) => {
      return result.text()
    }).then((text) => {
      console.log(text)
      if (text == "ready") {
        dealerCardsInterval = setInterval(showDealerCards, 3000)
      }
    })
  })
}

function showDealerCards() {
  fetch('/get/dealer/multi').then((result) => {
    return result.json()
  }).then((text) => {
    var final = ''
    //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
    for (c in text.CurrentHand) {
      //console.log(text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Value + ".png")
      final += '<img class = "card" src="img/' + text.CurrentHand[c].Suit.toLowerCase() + text.CurrentHand[c].Name.toLowerCase() + ".png" + '" alt="My Image"></img>'
      currentTotal += text.CurrentHand[c].Value
    }
    //console.log(final)
    current = document.getElementById("dealerhand");
    //document.getElementById("dealerTotal").innerHTML = 'Total: ' + text.Total;
    if (current.innerHTML != final && final != "") {
      current.innerHTML = final
      // if (message != "") {
      //   document.getElementById("startButton").disabled = false;
      //   document.getElementById("betinput").disabled = false;
      //   document.getElementById("stayButton").disabled = true;
      //   document.getElementById("hitButton").disabled = true;
      //   alert(message + " Updated stats.");
      // }
    }
    fetch('/is/dealer/done').then((result) => {
      return result.text()
    }).then((answer) => {
      console.log(answer)
      if (answer == "yes") {
        console.log(rand2)
        clearInterval(dealerCardsInterval)
        if (rand2 == 0) {
          getFinalStanding(dealerTotal)
          rand2++
        }
      }
    })
  })
}

function getFinalStanding(dealerTotal) {
  console.log('here')
  fetch('/get/user').then((result) => {
    return result.json()
  }).then((user) => {
    fetch('/get/dealer/multi').then((resu) => {
      return resu.json()
    }).then((dealer) => {
      dealerTotal = dealer.Total
    if (user.Total < 22) {
      if (user.Total > dealerTotal) {
        alert("You won against the dealer! Stats updated. Press start to play again.")
        updatePlayer("won")
        document.getElementById("startButton").disabled = false;
        document.getElementById("betinput").disabled = false;
      }
      else if (user.Total < dealerTotal) {
        alert("You lost against the dealer. Press start to play again.")
        updatePlayer("lost")
        document.getElementById("startButton").disabled = false;
        document.getElementById("betinput").disabled = false;
      }
      else if (user.Total == dealerTotal) {
        alert("You tied with the dealer. Stats updated. Press start to play again.")
        updatePlayer("tied")
        document.getElementById("startButton").disabled = false;
        document.getElementById("betinput").disabled = false;
      }
    }
  })
  })

}

function showOtherCards(game) {
  players = game.Players;
  cards = game.Hands;
  turn = game.Turn;
  document.getElementById("dealerhand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/cardback.jpeg">'
  fetch('/get/user').then((userRes) => {
    return userRes.json()
  }).then((user) => {
    if (players[0] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/' + cards[0].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';
      // if (turn == user.username) {
      //   document.getElementById("stayButton").disabled = false;
      //   document.getElementById("hitButton").disabled = false;
      // }
      return;
    }
    else if (players[1] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/' + cards[1].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';
      return;
    }
    else if (players[2] == user.username) {
      document.getElementById("3hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[4].split(" ")[1] + '.png">';
      document.getElementById("2hand").innerHTML = '<img class = "card" src="img/cardback.jpeg"><img class = "card" src="img/' + cards[5].split(" ")[1] + '.png">';
      document.getElementById("1hand").innerHTML = '<img class = "card" src="img/' + cards[2].split(" ")[1] + '.png"><img class = "card" src="img/' + cards[6].split(" ")[1] + '.png">';
      return;
    }
  }).then(() => {

  })
}