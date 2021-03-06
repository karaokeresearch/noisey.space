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
var placeInLine=[];











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
//  console.log("*********TOTAL CONNECTED TO /client******\n");
  
  for (var id in io.of('/client').connected) {
    var s = io.of('/client').connected[id].id;
    //console.log(s);
  }
    console.log('sending auth request');
    socket.emit('authRequest')
 
  
  
  socket.on('danceStatus', function (data) { //incoming dance amount data
                if (socket.deviceID){ //we have a deviceID associated with this device
                   for (var i=0; i<3; i++){ //let's run through the clients
                       if (slot[i] && slot[i].deviceID===socket.deviceID){ //is this a slotted client?
                            //console.log("match", socket.deviceID, i);
                            data.slot=i;
                            display.emit('clientDance', data);
  
                              if (data.danceScore >10 && data.buttonPushed===true){ //every time the user is not violating the rules, reset their lease
                                  slot[i].lastGoodDance=Date.now();
                              }                                                    
                        };
                    }       
                  
                }else{ //no deviceID associated.

                }
                    
                    


   });

  socket.on('register', function (data) { //incoming registration info
      socket.deviceID = data.deviceID;
      console.log(data.deviceID + " registered");
      
      if (placeInLine.indexOf(data.deviceID)===-1){placeInLine.push(data.deviceID);} //only add it if it's not already there
      
                  //console.log("cccccccccccccccc added");
                  //console.log(placeInLine);
                  //console.log("cccccccccccccccc");

      allocateSlots(data.deviceID);
         
               
   });


});



//display:

var display= io.of('/display');
display.on('connection', function(socket){
  console.log('A display connected!');


});

var emitCommandByDeviceID = function(targetDeviceID,commandToSend,parameter, callback){
    //if (targetDeviceID==="bab34b4c-7a81-4f17-942e-33a4733de963" && commandToSend==="assignSlot"){ console.log("trying to emit:",targetDeviceID,commandToSend,parameter)};
    for (var id in io.of('/client').connected) { //let's look at each connected client 
        var deviceID = io.of('/client').connected[id].deviceID;
        //console.log("looking at", deviceID);        
        if (targetDeviceID === deviceID){
            //console.log ("EMITTING: ", commandToSend, parameter);
            io.of('client').connected[id].emit('command', {'command':commandToSend,
                                                           'parameter':parameter
                                                            });
            
           
            for (var i=0; i<3; i++){//look through the slot array and see if the entry is already there
                if (slot[i] && slot[i].deviceID===deviceID){
                                    display.emit('command', {'command':commandToSend,
                                    'parameter':parameter,
                                     'slot':i
                                     });                                                            
            
                    
                    };
            }
            
            
        }
    }    
   typeof callback === 'function' && callback(); //this is how you do an optional callback because this language is weird
}



var allocateSlots = function(deviceIDtoRegister){
//    for (dID in placeInLine) { //let's look at each client on the list. These are device IDs
//        for (var sid in io.of('/client').connected) { //session IDs 
//            var deviceID = io.of('/client').connected[sid].deviceID;
//            var alreadyAdded=false;
//            if (deviceID ===did){//device still is attached. 
//                for (var i=0; i<4; i++){//look through the slot array and see if the entry is already there
//                   if (slot[i] && slot[i].deviceID===deviceID){alreadyAdded=true};
//    }
//
//  }
//

  //for (var id in io.of('/client').connected) { //let's look at each connected client 
  //  console.log("id:" + id);
    //var deviceID = io.of('/client').connected[id].deviceID;
 for (w in placeInLine){
    var deviceID=placeInLine[w];
    //console.log("we found ", deviceID);
    var alreadyAdded=false;
    
    for (var i=0; i<3; i++){//look through the slot array and see if the entry is already there - for when the player accidentally disconnects and rejoins
        if (slot[i] && slot[i].deviceID===deviceID){
            alreadyAdded=true;
            if (deviceID===deviceIDtoRegister){
                emitCommandByDeviceID(deviceID, "assignSlot", i);
                }
            };
    }
    
    if (!alreadyAdded && deviceID) {  //if not, add it!... but only if deviceID is defined 
        var ableToAdd=false;
        for (var i=0; i<3; i++){
            if (!slot[i]){
                slot[i]={};
                slot[i].deviceID=deviceID;
                slot[i].lastGoodDance=Date.now();
                console.log("ASSIGNING " + deviceID, i);
                emitCommandByDeviceID(deviceID, "assignSlot", i);
                ableToAdd=true;
                break;
            }
        }
        if (ableToAdd===false){emitCommandByDeviceID(deviceID, "console", "all slots full");}
    }
  }  
  
//console.log("slot:");
//console.log(slot);

};



setInterval(function(){  //queue that runs every second to check on user activity,.
                    //console.log("------");
                    //console.log(placeInLine);
                    //console.log("------");

    for (var i=0; i<3; i++){ //is this a slotted client?
        if (slot[i]){
                if (Date.now() - slot[i].lastGoodDance >15000){ //timeout
                    console.log("more than 15 seconds since good user activity on slot", i);
                    console.log("deleting.");
                    var devid = slot[i].deviceID;

                    while(placeInLine.indexOf(slot[i].deviceID)!==-1){placeInLine.splice(placeInLine.indexOf(slot[i].deviceID),1)} //clean out any and all entries in the queue of the offender
  
                    emitCommandByDeviceID(devid, "disconnected", true, function(){
                        console.log("*******************************splicing", devid);
                        delete slot[i];
                        allocateSlots();
                     });
      
                } else{
                    var secondsLeft=(15-(Date.now() - slot[i].lastGoodDance)/1000).toFixed(0);
                    
                    if (secondsLeft<15){emitCommandByDeviceID(slot[i].deviceID, "secondsLeft", secondsLeft );}
                }
       }       
   }      
//
//
//
      
},1000);





console.log("Running noisey.space");

}());

