const wsServer = require('ws').Server;
const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();

const motd = String.raw`
_____/\\\\\\\\\\\____/\\\________/\\\__/\\\\\\\\\\\\\___
 ___/\\\/////////\\\_\/\\\_______\/\\\_\/\\\/////////\\\_
  __\//\\\______\///__\/\\\_______\/\\\_\/\\\_______\/\\\_
   ___\////\\\_________\/\\\_______\/\\\_\/\\\\\\\\\\\\\\__
    ______\////\\\______\/\\\_______\/\\\_\/\\\/////////\\\_
     _________\////\\\___\/\\\_______\/\\\_\/\\\_______\/\\\_
      __/\\\______\//\\\__\//\\\______/\\\__\/\\\_______\/\\\_
       _\///\\\\\\\\\\\/____\///\\\\\\\\\/___\/\\\\\\\\\\\\\/__
        ___\///////////________\/////////_____\/////////////____

* Developed By PUM-8
`
// You're free to add to the credits if you inherit the project
console.log(motd);

// Print environment variables
console.log("Started with VERBOSE: " + process.env.VERBOSE);
console.log("Started with DATABASE: " + process.env.DB_NAME + " (" + process.env.DB_HOST + ":" + process.env.DB_PORT + ")");
console.log("");



//
//    WEBSOCKET SERVER
//

const ws = new wsServer({
    port: parseInt(process.env.WS_PORT)
});
console.log("Websocket Server Listening on port: " + process.env.WS_PORT);

// Load WS manager
const wsManager = require('./websocket/wsManager')(ws);



//
//    HTTP SERVER
//

const routeManager = require('./routes/routeManager')(app);

app.listen(parseInt(process.env.HTTP_PORT), () => {
    console.log("HTTP Server Listening on port: " + process.env.HTTP_PORT);
});

module.exports.closeServer = function () {
    ws.close();
};
module.exports.httpServer = app;
