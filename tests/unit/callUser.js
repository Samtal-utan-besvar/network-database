const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function callUser(done, wsClientMain, wsClientContact, userMain, userContact) {
    wsClientMain.removeAllListeners();
    wsClientContact.removeAllListeners();
    var completedSteps = 0;

    wsClientMain.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Placed');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientContact.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'call');
            assert.equal(JSONData['SENDER_PHONE_NUMBER'], userMain.phoneNumber);
            assert.equal(JSONData['RECEIVER_PHONE_NUMBER'], userContact.phoneNumber);
            assert.notEqual(JSONData['SDP'], null);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientMain, userMain.token, function () {
        wsClientMain.send(JSON.stringify({
            'REASON': 'call',
            'SENDER_PHONE_NUMBER': userMain.phoneNumber,
            'RECEIVER_PHONE_NUMBER': userContact.phoneNumber,
            'SDP': 'Something'
        }));
    });
}

module.exports = callUser;