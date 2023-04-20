currentUser = ''
function createUser() {
  let n = document.getElementById('username').value;
  let pw = document.getElementById('password').value;
  let url = '/add/user/';
  let data = { username: n, password: pw};
  let p = fetch(url, {
    method: 'POST', 
    body: JSON.stringify(data),
    headers: {"Content-Type": "application/json"}
  });
  p.then((data) => {
    return data.text(); 
  }).then((text) => {
     if(text == "Created new Account!"){
        alert(text)
        window.location.href = 'index.html'
     }else{
      alert(text);
     }
  });
}


function login(){
    var user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    let data = { u: user, p: pass};
    currentUser = data.u
    let url = '/account/login/'
    let p = fetch(url, {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    });
    p.then((data) => {
        return data.text();})
        .then((text) =>{
        
        if (text == 'LOGIN'){
            window.location.href = '/home.html'          
        }else{
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
  let url = '/add/item/'+ currentUser;
  let data = { title: n, description: d, image: i, price:p, stat:s};
  let p1 = fetch(url, {
    method: 'POST', 
    body: JSON.stringify(data),
    headers: {"Content-Type": "application/json"}
  });
  p1.catch(() => { 
    alert('something went wrong');
  });
 }

//Redirects page to post
function createListing(){
  window.location.href = '/app/post.html'
}


// will display all the item on the listing
function viewList(){
  let retvalLoc = document.getElementById("listing");
  let url = '/get/listings'
  let p  = fetch(url)
  p.then((response) =>{
   
    return response.json()})
    .then((data) => {
        var final = ""
     
      for(i in data){
        final = final + '<div id ="item">\n'+"<div><b>"+data[i].title
        +"</b></div><div>"+'<img src="'+data[i].image+'" alt="'+data[i].description
        +'"></div><div>'+data[i].stat+'</div></div></div>'
        retvalLoc. innerHTML = final;
       }
    });

  p.catch((err) => {
    console.log(err);
  })
}

// will purchase an item
function purchaseListing(id){
  url = '/buy/item/'+id;
  fetch(url)
  .then((data) =>{
    viewList();
  })
}


// will search the listing with the given keep word
function searchItems(){
  let keyWord = document.getElementById("search").value;
  let retvalLoc = document.getElementById("listing");
  let url = '/search/items/'+ keyWord
  let p  = fetch(url)
  p.then((response) =>{
   
    return response.json()})
    .then((data) => {
        console.log(data)
        var final = ""
        var currStatus = ''
      for(i in data){
      let func = '"purchaseListing('+"'"+String(data[i]._id)+"'"+');"'
       if (data[i].stat  == "SALE"){
           currStatus = '<input type="button" id="purchaseButtom" onclick='+func+' value="Buy Now"/>'
       }else{
        currStatus = "Item is already Purchased"
        }
        final = final + '<div id ="item">\n'+"<div><b>"+data[i].title
        +"</b></div><div>"+'<img src="'+data[i].image+'" alt="'+data[i].description
        +'"></div><div>'+currStatus+'</div></div></div>'
        retvalLoc. innerHTML = final;
       }
    });

  p.catch((err) => {
    console.log(err);
  })
}
  
// will display the listings in the purchases.
function viewpurchases(){
  let retvalLoc = document.getElementById("listing");
  let url = '/get/purchases'
  
  let p  = fetch(url)
  p.then((response) =>{
   
    return response.json()})
    .then((data) => {
        var final = ""
     
      for(i in data){
        
        final = final + '<div id ="item">\n'+"<div><b>"+data[i].title
        +"</b></div><div>"+'<img src="'+data[i].image+'" alt="'+data[i].description
        +'"></div><div>'+data[i].stat+'</div></div></div>'
        retvalLoc. innerHTML = final;
       }
    });

  p.catch((err) => {
    console.log(err);
  })
}

// Will get the currents users name.
function getUser(){
  url = '/get/user'
  fetch(url)
   .then((results) =>{
     return results.json();
   })
   .then((text) =>{
    console.log(text)
    usernameNav= document.getElementById("Welcome");
    usernameNav.innerText = "Welcome "+text.username+"!";
    currentUser = text.username
    usernameNav= document.getElementById("usernamePara");
    usernameNav.innerText = text.username;
    bal= document.getElementById("balancePara");
    bal.innerText = "Balance: "+text.balance;
    rounds= document.getElementById("rounds");
    rounds.innerText = "Rounds Played: "+text.roundsPlayed;
    wins= document.getElementById("wins");
    wins.innerText = "Wins: "+text.Wins;
    losses= document.getElementById("loss");
    losses.innerText = "Losses: "+text.Losses;
    Ties = document.getElementById("ties");
    Ties.innerText = "Ties: "+text.Ties;

   })
   }
   
   function singlePlayer(){
    window.location.href = '/singleGame.html'
   }

   function multiPlayer(){
    window.location.href = '/multiGame.html'
   }

   function exit(){
    window.location.href = '/home.html'
   }

   function signout(){
    window.location.href = '/index.html'
   }

hands = {}
function start(){
  fetch('/start/deal/')
  .then((result) => {
    url = '/get/user'
    fetch(url)
     .then((results) =>{
       return results.json();
     })

     .then((text) =>{
      var final = ''
      //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
      for( c in text.CurrentHand){
        console.log(text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Value+".png")
        final +='<img id = "card" src="img/'+text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Name.toLowerCase()+".png"+'" alt="My Image"></img>'
      }
      console.log(final)
      current = document.getElementById("currenthand");
      current.innerHTML = final})})}
    
currentTotal = 0;
function hit(){
  currentTotal = 0;
  fetch('/hit/card/')
  .then((result) => {
    url = '/get/user'
    fetch(url)
      .then((results) =>{
        console.log("yes")
        return results.json();
      })

      .then((text) =>{
     
      var final = ''
      //<img id = "card" src="img/aceclubs.png" alt="My Image"></img>
      for( c in text.CurrentHand){
        console.log(text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Value+".png")
        final +='<img id = "card" src="img/'+text.CurrentHand[c].Suit.toLowerCase()+text.CurrentHand[c].Name.toLowerCase()+".png"+'" alt="My Image"></img>'
        currentTotal += text.CurrentHand[c].Value 
      }
      console.log(final)
      current = document.getElementById("currenthand");
      current.innerHTML = final
      if(currentTotal > 21 ){
        alert("BUST")
        current.innerHTML = "END"

      }})})}

 

DealercurrentTotal = 0;
function stay(){
  let url = '/turn/dealer/'
  fetch(url)
  .then((response) =>{
    return response.text()
  })
  .then((text) => {
    if(text == "BUST"){
      alert("Dealer Busted. You Win")
      showCards()
    }
    if(text == "DEALER"){
      alert("Dealer Won")
      showCards()
    }
    if(text == "PLAYER"){
      alert("You win")
    }
  })
}
