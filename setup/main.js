const wsServer = require('ws').Server;
const express = require('express');
const emailManager = require('../email/emailManager');
const logger = require('../logger/common');
const app = express();
app.use(express.json());
require('dotenv').config();

var subscribedSetupCallback = [];

const setupMain = new Promise((resolve, reject) => {
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
    logger.printHeader("General Settings");
    console.log("Started with VERBOSE: " + process.env.VERBOSE + "\n");



    //
    //      WEBSOCKET SERVER
    //

    const ws = new wsServer({
        port: parseInt(process.env.WS_PORT)
    });
    logger.printHeader("REST API Settings");
    console.log("Database Server Used: " + process.env.DB_NAME + " (" + process.env.DB_HOST + ":" + process.env.DB_PORT + ")");
    console.log("Websocket Server Listening on port: " + process.env.WS_PORT);

    // Load WS manager
    const wsManager = require('../websocket/wsManager')(ws);



    //
    //      HTTP SERVER
    //

    const routeManager = require('../routes/routeManager')(app);

    app.listen(parseInt(process.env.HTTP_PORT), () => {
        console.log("HTTP Server Listening on port: " + process.env.HTTP_PORT + "\n");
    });

    module.exports.closeServer = function () {
        ws.close();
    };
    module.exports.httpServer = app;



    //
    //      Email Manager
    //

    // Setup transporter and verify it's correctly setup
    emailManager.setupTransporter();
    function complete() {
        logger.printDivider() // Print divider when the transporter is verified

        // Notify all the subscribed callback functions
        for (callback of subscribedSetupCallback) {
            callback();
        }
        resolve();
    };
    emailManager.verifyEmailTransporter(complete);

    emailManager.sendPasswordChangeEmail("thegamer632@gmail.com", "TestCode");
});

function subscribeIsSetup(callback) {
    subscribedSetupCallback.push(callback);
}

module.exports.subscribeIsSetup = subscribeIsSetup;
module.exports.setupMain = setupMain;