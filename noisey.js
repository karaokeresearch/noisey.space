#!/usr/bin/env node

/*!
 * noisey.space
 *
 * Karaoke Research Council
 * http://brassrocket.com/krc
 *
 * Copyright 2016 Ross Brackett
 * Licensed under the GPL Version 3 license
 * http://www.gnu.org/licenses/gpl-3.0.txt
 *
 */

(function() {

var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app).listen(process.env.PORT||80),
    io = require('socket.io').listen(server, {
        log: false
    });

app.use(express.static(__dirname + '/static')); //Where the static files are loaded from
//app.use('/audio', express.static(audioDirectory)); //Where the static files are loaded from

//************** URL handlers ********************

app.get('/helloworld', function (req, res) { //Meat of the HTML data that defines a page.  Loaded into the <BODY> area </BODY>
res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate'); //IE11 gets confused otherwise
res.end("Hello World!")
});

//************** LISTENERS ********************

io.on('connection', function (socket) {
    // Welcome messages on connection to just the connecting client
    socket.emit('connected', {
        message: "welcome"
    });
    
});

//There's two channels, client and display. Display is the HTML display screen that also plays the songs

//client:
var client = io.of('/client');
client.on('connection', function(socket){
  console.log('\n\nA client connected: ' + socket.id );
  console.log("*********TOTAL CONNECTED TO /client******\n");

  for (var id in io.of('/client').connected) {
    var s = io.of('/client').connected[id].id;
    console.log(s);
}
  
  
  
  
  socket.on('danceStatus', function (data) { //incoming dance amount data
               //console.log(data);
               display.emit('clientUpdate', data);
   });

});



//display:

var display= io.of('/display');
display.on('connection', function(socket){
  console.log('A display connected!');


});











console.log("Running noisey.space");

}());

