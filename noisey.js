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
    server = http.createServer(app).listen(80),
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
io.sockets.on('connection', function (socket) {
    // Welcome messages on connection to just the connecting client
    socket.emit('value', {
        message: "you are cool"
    });
 

    socket.on('danceamount', function (data) { //user is switching lyrics.
            console.log(data);
        
    });

});

console.log("Running noisey.space");

}());

