const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const assert = require('assert');

function sendIceCandidate(done, wsClientSender, wsClientReceiver, userSender, userReceiver) {
    wsClientSender.removeAllListeners();
    wsClientReceiver.removeAllListeners();

    wsClientReceiver.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'ICECandidate');
            assert.equal(JSONData['RECEIVER_PHONE_NUMBER'], userReceiver.phoneNumber);
            assert.equal(JSONData['SENDER_PHONE_NUMBER'], userSender.phoneNumber);
            assert.notEqual(JSONData['CANDIDATE'], null);
        }

        done();
    });

    waitForSocketConnection(wsClientSender, userSender.token, function () {
        wsClientSender.send(JSON.stringify({
            'REASON': 'ICECandidate',
            'RECEIVER_PHONE_NUMBER': userReceiver.phoneNumber,
            'SENDER_PHONE_NUMBER': userSender.phoneNumber,
            'CANDIDATE': 'candidateData'
        }));
    });
}

module.exports = sendIceCandidate;