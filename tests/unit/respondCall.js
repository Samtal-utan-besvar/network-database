const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function respondCall(done, response, wsClientSender, wsClientReceiver, userSender, userReceiver) {
    wsClientSender.removeAllListeners();
    wsClientReceiver.removeAllListeners();
    var completedSteps = 0;

    wsClientReceiver.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'callResponse');
            assert.equal(JSONData['RESPONSE'], response);
            assert.equal(JSONData['SENDER_PHONE_NUMBER'], userSender.phoneNumber);
            assert.equal(JSONData['RECEIVER_PHONE_NUMBER'], userReceiver.phoneNumber);
            assert.notEqual(JSONData['SDP'], null);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientSender.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Answer Sent');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientSender, userSender.token, function () {
        wsClientSender.send(JSON.stringify({
            'REASON': 'callResponse',
            'RESPONSE': response,
            'SENDER_PHONE_NUMBER': userSender.phoneNumber,
            'RECEIVER_PHONE_NUMBER': userReceiver.phoneNumber,
            'SDP': 'Something'
        }));
    });
}

module.exports = respondCall;