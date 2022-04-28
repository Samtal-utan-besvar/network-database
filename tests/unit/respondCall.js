const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function respondCall(done, response, wsClientCaller, wsClientResponder, userCaller, userResponder) {
    wsClientCaller.removeAllListeners();
    wsClientResponder.removeAllListeners();
    var completedSteps = 0;

    wsClientCaller.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'callResponse');
            assert.equal(JSONData['RESPONSE'], response);
            assert.equal(JSONData['CALLER_PHONE_NUMBER'], userCaller.phoneNumber);
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], userResponder.phoneNumber);
            assert.notEqual(JSONData['SDP'], null);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientResponder.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Answer Sent');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientResponder, userResponder.token, function () {
        wsClientResponder.send(JSON.stringify({
            'REASON': 'callResponse',
            'RESPONSE': response,
            'CALLER_PHONE_NUMBER': userCaller.phoneNumber,
            'TARGET_PHONE_NUMBER': userResponder.phoneNumber,
            'SDP': 'Something'
        }));
    });
}

module.exports = respondCall;