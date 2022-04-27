const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function hangUp(done, wsClientSender, wsClientReceiver, userSender, userReceiver) {
    wsClientSender.removeAllListeners();
    wsClientReceiver.removeAllListeners();
    var completedSteps = 0;

    wsClientSender.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Hang Up Sent');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientReceiver.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'HangUp');
            assert.equal(JSONData['CALLER_PHONE_NUMBER'], userSender.phoneNumber);
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], userReceiver.phoneNumber);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientSender, userSender.token, function () {
        wsClientSender.send(JSON.stringify({
            'REASON': 'HangUp',
            'CALLER_PHONE_NUMBER': userSender.phoneNumber,
            'TARGET_PHONE_NUMBER': userReceiver.phoneNumber
        }));
    });
}

module.exports = hangUp