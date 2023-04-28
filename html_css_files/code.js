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
        let retval = document.getElementById("error")
        retval.innerText = text;
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

//Redirects page to post
function createListing() {
  window.location.href = '/app/post.html'
}


// will display all the item on the listing
function viewList() {
  let retvalLoc = document.getElementById("listing");
  let url = '/get/listings'
  let p = fetch(url)
  p.then((response) => {

    return response.json()
  })
    .then((data) => {
      var final = ""

      for (i in data) {
        final = final + '<div id ="item">\n' + "<div><b>" + data[i].title
          + "</b></div><div>" + '<img src="' + data[i].image + '" alt="' + data[i].description
          + '"></div><div>' + data[i].stat + '</div></div></div>'
        retvalLoc.innerHTML = final;
      }
    });

  p.catch((err) => {
    console.log(err);
  })
}

// will purchase an item
function purchaseListing(id) {
  url = '/buy/item/' + id;
  fetch(url)
    .then((data) => {
      viewList();
    })
}


// will search the listing with the given keep word
function searchItems() {
  let keyWord = document.getElementById("search").value;
  let retvalLoc = document.getElementById("listing");
  let url = '/search/items/' + keyWord
  let p = fetch(url)
  p.then((response) => {

    return response.json()
  })
    .then((data) => {
      console.log(data)
      var final = ""
      var currStatus = ''
      for (i in data) {
        let func = '"purchaseListing(' + "'" + String(data[i]._id) + "'" + ');"'
        if (data[i].stat == "SALE") {
          currStatus = '<input type="button" id="purchaseButtom" onclick=' + func + ' value="Buy Now"/>'
        } else {
          currStatus = "Item is already Purchased"
        }
        final = final + '<div id ="item">\n' + "<div><b>" + data[i].title
          + "</b></div><div>" + '<img src="' + data[i].image + '" alt="' + data[i].description
          + '"></div><div>' + currStatus + '</div></div></div>'
        retvalLoc.innerHTML = final;
      }
    });

  p.catch((err) => {
    console.log(err);
  })
}

// will display the listings in the purchases.
function viewpurchases() {
  let retvalLoc = document.getElementById("listing");
  let url = '/get/purchases'

  let p = fetch(url)
  p.then((response) => {

    return response.json()
  })
    .then((data) => {
      var final = ""

      for (i in data) {

        final = final + '<div id ="item">\n' + "<div><b>" + data[i].title
          + "</b></div><div>" + '<img src="' + data[i].image + '" alt="' + data[i].description
          + '"></div><div>' + data[i].stat + '</div></div></div>'
        retvalLoc.innerHTML = final;
      }
    });

  p.catch((err) => {
    console.log(err);
  })
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
  code = document.getElementById('code');
  if (code.value) {
    // and if code exists
    window.location.href = 'waitingCustom.html'
  }

}