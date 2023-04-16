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

const connection_string = 'mongodb://127.0.0.1:27017/blackjack';


mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});
// creates Schema for items 
var CardSchema = new mongoose.Schema( {
    Suit: String,
    Name: String,
    Value: Number,
    Player: String
});
var Card = mongoose.model('Cards', CardSchema);

function loadcards(){
const lineReader = require('line-reader');
lineReader.eachLine('./cards.txt', function (line) {
    if (line[0] != '#') {
        var params = line.split(',');
        console.log(params)
        var newCard = new Card({
            Suit: params[0],
            Name: params[1],
            Value: Number(params[3]),
            Player: "In Deck"
        });
      
        newCard.save();
    }
});
}
loadcards();
