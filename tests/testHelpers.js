const wsWebSocket = require('ws').WebSocket;

function createWebsocket(adress) {
    return new wsWebSocket(adress);
}

function waitForSocketConnection(socket, callback) {
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                if (process.env.ENV_VERBOSE == true) console.log("Connection is active...");
                if (callback != null) {
                    callback();
                }
            } else {
                if (process.env.ENV_VERBOSE == true) console.log("Wait for connection...");
                waitForSocketConnection(socket, callback);
            }

        }, 5); // wait 5 milisecond for the connection
}

module.exports.createWebsocket = createWebsocket;
module.exports.waitForSocketConnection = waitForSocketConnection;