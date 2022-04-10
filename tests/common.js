require('dotenv').config({ path: './config.env' });
const wsWebSocket = require('ws').WebSocket;

function createWebsocket(adress) {
    return new wsWebSocket(adress);
}

// Wait for valid connection state and response with token
function waitForSocketConnection(socket, token, callback) {
    setTimeout(
        function () {
            if (socket.readyState === 1 && token) {
                if (process.env.VERBOSE == true) console.log("Connection is active...");
                if (callback != null) {
                    callback();
                }
            } else {
                if (process.env.VERBOSE == true) console.log("Wait for connection...");
                waitForSocketConnection(socket, token, callback);
            }

        }, 5); // wait 5 milisecond for the connection
}

module.exports.createWebsocket = createWebsocket;
module.exports.waitForSocketConnection = waitForSocketConnection;