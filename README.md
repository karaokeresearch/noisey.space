# NOISEY.SPACE
noisey.space is a browser-based video game wherein up to 3 players control the volume of an individual track
of a multi-track (stem) recording by dancing. Accelerometer data is passed from the cell phone, over socket.io to a node server which then relays the information to Displaysceen.html, which controls the entire thing and plays the multi-track stems. Be warned this application is very disk and RAM-intensive, needing ~500MB-1.5GB of RAM, depending on the song. It works way better when the stems are hosted off an SSD.

Basics of how to use noisey.space:
* Locate stems 
* Arrange a directory so that each subdirectory is one song's worth of stem files

        \
        \The Cool Dudes - Ping Pongaz
        \The Cool Dudes - Ping Pongaz\Bass.ogg
        \The Cool Dudes - Ping Pongaz\Vocals.ogg
        \The Cool Dudes - Ping Pongaz\Guitar.ogg
        \The Cool Dudes - Ping Pongaz\Keys.ogg              

* From that directory, run indexwebserver.js to generate a manifest of your songs

        node findsongs.js > manifest.JSON

* Host 'em, using CORS if necessary. I have used the node package http-server with great success using this execution string:

        http-server --cors -p 8080 .

* Run noisey.space

        npm install
        node noisey.js
       
       
* Connect a mobile browser to http://server/, and a desktop browser to http://server/displayscreen.html (or http://localhost/displayscreen.html)

* Dance while holding your phone and the meter goes up. Push the button and sound comes out. Have fun!