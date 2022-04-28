
const wsWebSocket = require('ws').WebSocket;

function createWebsocket(adress) {
    return new wsWebSocket(adress);
}

// Wait for valid connection state and response with token
function waitForSocketConnection(socket, token, callback) {
    setTimeout(
        function () {
            if (socket.readyState === 1 && token) {
                if (process.env.VERBOSE == 'true') console.log("Connection is active...");
                if (callback != null) {
                    callback();
                }
            } else {
                if (process.env.VERBOSE == 'true') console.log("Wait for connection...");
                waitForSocketConnection(socket, token, callback);
            }

        }, 5); // wait 5 milisecond for the connection
}

function randomEmail() {
    return (Math.random() + 1).toString(36).substring(2) + "@domain.test";
}

function randomPhoneNumber() {
    return Math.round(Math.random() * (8999999999) + 1000000000).toString();
}

module.exports.randomEmail = randomEmail;
module.exports.randomPhoneNumber = randomPhoneNumber;
module.exports.createWebsocket = createWebsocket;
module.exports.waitForSocketConnection = waitForSocketConnection;