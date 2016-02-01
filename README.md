# NOISEY.SPACE
noisey.space is a browser-based video game wherein up to 3 players control the volume of an individual track of a multi-track (stem) recording by dancing.  Accelerometer data is passed from the cell phone, over socket.io to a node server which then relays the information to displaysceen.html, which controls the entire thing and plays the multi-track stems. Be warned this application is very disk and RAM-intensive, needing ~500MB-1.5GB of RAM, depending on the song. It works way better when the stems are hosted off an SSD.

How to make your own noisey.space:
* Locate stems files in .ogg format
* Arrange a directory so that each subdirectory is one song's worth of stem files

        \
        \The Cool Dudes - Ping Pongaz
        \The Cool Dudes - Ping Pongaz\Bass.ogg
        \The Cool Dudes - Ping Pongaz\Vocals.ogg
        \The Cool Dudes - Ping Pongaz\Guitar.ogg
        \The Cool Dudes - Ping Pongaz\Keys.ogg              
        \God Bless Wisconsin - Gorilla Kiss
        \God Bless Wisconsin - Gorilla Kiss\Vocals.ogg
        \God Bless Wisconsin - Gorilla Kiss\Bass.ogg
        \God Bless Wisconsin - Gorilla Kiss\Synth.ogg
        \God Bless Wisconsin - Gorilla Kiss\Marimba.ogg
        \God Bless Wisconsin - Gorilla Kiss\Theramin.ogg 
        \manifest.JSON

* From the root stems directory, run indexwebserver.js to generate a manifest of your songs

        node findsongs.js > manifest.JSON

* Host 'em on port 8080, using CORS if necessary. I have used the node package http-server with great success, using this execution string from the root stems directory:

        npm install -g http-server
        http-server --cors -p 8080 .

* Open displayscreen.html in a text editor and change all references from ns.mod.bx to the URL of your node server

* Run noisey.space, either from your PC or deploy to the cloud if you want everyone connected to the Internet to be able to play

        npm install
        node noisey.js
       
* Have your players connect to http://my-node-server/, and a desktop browser to http://my-node-server/displayscreen.html (or http://localhost/displayscreen.html)

* Dance while holding your phone and the meter goes up. Push the button and sound comes out. Have fun!