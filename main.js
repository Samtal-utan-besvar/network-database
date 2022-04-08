const express = require('express');
const app = express();

// setup app
app.use(express.json());

const routeManager = require('./routeManager')(app);
const wsServer = require('ws').Server;

const httpPort = 8080;
const wsPort = 4000;

const ws = new wsServer({
    port: wsPort
});
console.log("Server Listening on port: " + wsPort);

// Load WS manager
const wsManager = require('./websocket/wsManager')(ws);

app.listen(httpPort, () => {
    console.log("Server running on port: " + httpPort);
});

// MODULE EXPORTS

module.exports.closeServer = function () {
    ws.close();
};

module.exports.httpServer = app;
