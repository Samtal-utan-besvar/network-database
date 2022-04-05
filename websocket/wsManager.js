const connect = require('./wsCalls').connect;
const call = require('./wsCalls').call;
const callResponse = require('./wsCalls').callResponse;
const ICECandidate = require('./wsCalls').ICECandidate;
const hangUp = require('./wsCalls').hangUp;

var clients = {};

function wsManager(ws) {
    ws.on('connection', (conn) => {
        if (process.env.ENV_VERBOSE) console.log("COMMON: New WS/WSS Connection.");

        conn.on('message', (message) => {
            var JSONMessage;

            try {
                JSONMessage = JSON.parse(message);
            } catch (e) {
                console.log(e); // Couldn't parse the JSON object
            }

            if (JSONMessage['REASON'] == 'connect') {
                connect(conn, JSONMessage, clients);
            } else if (JSONMessage['REASON'] == 'call') {
                call(conn, JSONMessage, clients);
            } else if (JSONMessage['REASON'] == 'callResponse') {
                callResponse(conn, JSONMessage, clients);
            } else if (JSONMessage['REASON'] == 'ICECandidate') {
                ICECandidate(conn, JSONMessage, clients);
            } else if (JSONMessage['REASON'] == 'HangUp') {
                hangUp(conn, JSONMessage, clients);
            }
        });
    });
}

module.exports = wsManager;