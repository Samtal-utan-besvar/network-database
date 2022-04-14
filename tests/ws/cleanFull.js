const assert = require('assert');
const createWebsocket = require('../common.js').createWebsocket;
const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var server = require('../../main.js');

// Environment variables
chai.use(chaiHttp);
const wsPort = 4000
const wsAdress = 'ws://localhost:' + wsPort;

var wsClientA;
var wsClientAToken;
const wsClientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
const wsClientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();
var wsClientB;
var wsClientBToken;
const wsClientBEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
const wsClientBPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 
*/

// TODO: Add more testing, none clean to test server error manageability.

// Test the creation of user A
it('Create user A', (done) => {
    var userRequest = {
        "firstname": "Gunnar",
        "lastname": "Johansson",
        "phone_number": wsClientAPhoneNumber,
        "email": wsClientAEmail,
        "password": "SuperSecure"
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            wsClientAToken = res.body
            done();
        });
});

it('Create user B', (done) => {
    var userRequest = {
        "firstname": "Gunnar",
        "lastname": "Johansson",
        "phone_number": wsClientBPhoneNumber,
        "email": wsClientBEmail,
        "password": "SuperSecure"
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            wsClientBToken = res.body
            done();
        });
});

// Test the creation of a connection
it('Create WS Connection - Client A', (done) => {
    wsClientA = createWebsocket(wsAdress);
    done();
});
it('Create WS Connection - Client B', (done) => {
    wsClientB = createWebsocket(wsAdress);
    done();
});

// Test the connection establishment
it('Establish Client Connection - Client A', (done) => {
    wsClientA.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Connected');
        }

        done();
    });

    waitForSocketConnection(wsClientA, wsClientAToken, function () {
        wsClientA.send(JSON.stringify({
            'REASON': 'connect',
            'TOKEN': wsClientAToken
        }));
    });
});

it('Establish Client Connection - Client B', (done) => {
    wsClientB.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Connected');
        }

        done();
    });

    waitForSocketConnection(wsClientB, wsClientBToken, function () {
        wsClientB.send(JSON.stringify({
            'REASON': 'connect',
            'TOKEN': wsClientBToken
        }));
    });
});

// Test Client A Calling Client B
it('Client A Calling Client B', (done) => {
    wsClientA.removeAllListeners();
    wsClientB.removeAllListeners();
    var completedSteps = 0;

    wsClientA.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Placed');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientB.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'call');
            assert.equal(JSONData['CALLER_PHONE_NUMBER'], wsClientAPhoneNumber);
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], wsClientBPhoneNumber);
            assert.notEqual(JSONData['SDP'], null);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientA, wsClientAToken, function () {
        wsClientA.send(JSON.stringify({
            'REASON': 'call',
            'CALLER_PHONE_NUMBER': wsClientAPhoneNumber,
            'TARGET_PHONE_NUMBER': wsClientBPhoneNumber,
            'SDP': 'Something'
        }));
    });
});

// Test accepting the call
it('Client B Accept Call', (done) => {
    wsClientA.removeAllListeners();
    wsClientB.removeAllListeners();
    var completedSteps = 0;

    wsClientA.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'callResponse');
            assert.equal(JSONData['RESPONSE'], 'accept');
            assert.equal(JSONData['CALLER_PHONE_NUMBER'], wsClientAPhoneNumber);
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], wsClientBPhoneNumber);
            assert.notEqual(JSONData['SDP'], null);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientB.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Answer Sent');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientB, wsClientBToken, function () {
        wsClientB.send(JSON.stringify({
            'REASON': 'callResponse',
            'RESPONSE': 'accept',
            'CALLER_PHONE_NUMBER': wsClientAPhoneNumber,
            'TARGET_PHONE_NUMBER': wsClientBPhoneNumber,
            'SDP': 'Something'
        }));
    });
});

// Test client A sending ICE candidates to client B
it('Client A Sending ICE Candidate to Client B', (done) => {
    wsClientA.removeAllListeners();
    wsClientB.removeAllListeners();

    wsClientB.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'ICECandidate');
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], wsClientBPhoneNumber);
            assert.equal(JSONData['ORIGIN_PHONE_NUMBER'], wsClientAPhoneNumber);
            assert.notEqual(JSONData['CANDIDATE'], null);
        }

        done();
    });

    waitForSocketConnection(wsClientA, wsClientAToken, function () {
        wsClientA.send(JSON.stringify({
            'REASON': 'ICECandidate',
            'TARGET_PHONE_NUMBER': wsClientBPhoneNumber,
            'ORIGIN_PHONE_NUMBER': wsClientAPhoneNumber,
            'CANDIDATE': 'candidateData'
        }));
    });
});

// Test client B sending ICE candidates to client A
it('Client B Sending ICE Candidate to Client A', (done) => {
    wsClientA.removeAllListeners();
    wsClientB.removeAllListeners();

    wsClientA.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'ICECandidate');
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], wsClientAPhoneNumber);
            assert.equal(JSONData['ORIGIN_PHONE_NUMBER'], wsClientBPhoneNumber);
            assert.notEqual(JSONData['CANDIDATE'], null);
        }

        done();
    });

    waitForSocketConnection(wsClientB, wsClientBToken, function () {
        wsClientB.send(JSON.stringify({
            'REASON': 'ICECandidate',
            'TARGET_PHONE_NUMBER': wsClientAPhoneNumber,
            'ORIGIN_PHONE_NUMBER': wsClientBPhoneNumber,
            'CANDIDATE': 'candidateData'
        }));
    });
});

// Test client A hang up on client B
it('Client A Hang Up on Client B', (done) => {
    wsClientA.removeAllListeners();
    wsClientB.removeAllListeners();
    var completedSteps = 0;

    wsClientA.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['RESPONSE'], 'Call Hang Up Sent');
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    wsClientB.on('message', (data) => {
        var JSONData = JSON.parse(data);
        if (JSONData['ERROR']) {
            throw new Error(data);
        } else {
            assert.equal(JSONData['REASON'], 'HangUp');
            assert.equal(JSONData['CALLER_PHONE_NUMBER'], wsClientAPhoneNumber);
            assert.equal(JSONData['TARGET_PHONE_NUMBER'], wsClientBPhoneNumber);
        }

        completedSteps == 1 ? done() : completedSteps++;
    });

    waitForSocketConnection(wsClientA, wsClientAToken, function () {
        wsClientA.send(JSON.stringify({
            'REASON': 'HangUp',
            'CALLER_PHONE_NUMBER': wsClientAPhoneNumber,
            'TARGET_PHONE_NUMBER': wsClientBPhoneNumber
        }));
    });
});

it('Close Server', (done) => {
    server.closeServer();
    done();
});


return 0;
