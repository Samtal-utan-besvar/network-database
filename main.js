const express = require('express');
require('dotenv').config();
const app = express();

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

// setup app
app.use(express.json());

const routeManager = require('./routeManager')(app);
const wsServer = require('ws').Server;

console.log(motd);
console.log("Started with VERBOSE: " + process.env.VERBOSE);


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

app.listen(parseInt(process.env.HTTP_PORT), () => {
    console.log("HTTP Server Listening on port: " + process.env.HTTP_PORT);
});

module.exports.closeServer = function () {
    ws.close();
};
module.exports.httpServer = app;
