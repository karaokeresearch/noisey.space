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


var slot=[]; //four slots for each channel












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
    //console.log(s);
}
  
  
  
  socket.on('danceStatus', function (data) { //incoming dance amount data
                if (socket.deviceID){ //we have a deviceID associated with this device
                   for (var i=0; i<4; i++){ //let's run through the clients
                       if (slot[i] && slot[i].deviceID===socket.deviceID){ //is this a slotted client?
                            //console.log("match", socket.deviceID, i);
                            data.slot=i;
                            display.emit('clientUpdate', data);
  
                              if (data.danceScore >10 || data.buttonPushed===true){ //every time the user is not violating the rules, reset their lease
                                  slot[i].lastGoodDance=Date.now();
                              }                                                    
                        };
                    }       
                  
                }else{ //no deviceID associated.
                 console.log('sending auth request');
                 socket.emit('authRequest')
                }
                    
                    


   });

  socket.on('register', function (data) { //incoming dance amount data
  socket.deviceID = data.deviceID;
  console.log(data.deviceID + " registered");
  allocateSlots();
     
               
   });


});



//display:

var display= io.of('/display');
display.on('connection', function(socket){
  console.log('A display connected!');


});

var emitCommandByDeviceID = function(targetDeviceID,commandToSend,parameter){
    //console.log("trying to emit to", targetDeviceID);
    for (var id in io.of('/client').connected) { //let's look at each connected client 
        var deviceID = io.of('/client').connected[id].deviceID;
        //console.log("looking at", deviceID);        
        if (targetDeviceID === deviceID){
            console.log ("EMITTING: ", commandToSend, parameter);
            io.of('client').connected[id].emit('command', {'command':commandToSend,
                                                           'parameter':parameter
                                                            });
            
        }
    }    
   
}



var allocateSlots = function(){

  for (var id in io.of('/client').connected) { //let's look at each connected client 
    //console.log("id:" + id);
    var deviceID = io.of('/client').connected[id].deviceID;
    var alreadyAdded=false;
    
    for (var i=0; i<4; i++){//look through the slot array and see if the entry is already there
        if (slot[i] && slot[i].deviceID===deviceID){alreadyAdded=true};
    }
    if (!alreadyAdded && deviceID) {  //if not, add it!... but only if deviceID is defined.
        for (var i=0; i<4; i++){
            if (!slot[i]){
                slot[i]={};
                slot[i].deviceID=deviceID;
                slot[i].lastGoodDance=Date.now();
                emitCommandByDeviceID(deviceID, "console", "you were added to slot " + i);
                break;
            }
        }
    }
  }  
  
console.log("slot:");
console.log(slot);

};



setInterval(function(){
    for (var i=0; i<4; i++){ //is this a slotted client?
    if (slot[i]){
            if (Date.now() - slot[i].lastGoodDance >15000){
                console.log("more than 15 seconds since good send on slot", i);
                console.log("deleting.");
                emitCommandByDeviceID(slot[i].deviceID, "console", "disconnected!" + i);
                delete slot[i];
                allocateSlots();
            } else{console.log(  (15-(Date.now() - slot[i].lastGoodDance)/1000).toFixed(0) + " seconds left on slot " + i );}
        }       
    }      
//
//
//
    
},1000);





console.log("Running noisey.space");

}());

