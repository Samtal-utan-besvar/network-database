const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function connectWebsocket(done, wsClient, user) {
    wsClient.removeAllListeners();

    wsClient.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Connected');
        }

        done();
    });

    waitForSocketConnection(wsClientA, user.token, function () {
        wsClient.send(JSON.stringify({
            'REASON': 'connect',
            'TOKEN': user.token
        }));
    });
}

module.exports = connectWebsocket;