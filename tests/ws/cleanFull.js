const createWebsocket = require('../common.js').createWebsocket;
const chai = require('chai');
const chaiHttp = require('chai-http');
const user = require('../user');
const createUser = require('../unit/createUser');
const connectWebsocket = require('../unit/connectWebsocket');
const callUser = require('../unit/callUser');
const respondCall = require('../unit/respondCall');
const sendIceCandidate = require('../unit/sendIceCandidate');
const hangUp = require('../unit/hangUp');

// Environment variables
chai.use(chaiHttp);
const wsPort = 4000
const wsAdress = 'ws://localhost:' + wsPort;

var userA = new user('Bob', 'Byggarn', 'Skopan');
var userB = new user('You', 'Shall', 'notPass');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().



TESTS:
 * Create 2 users
 * Create 2 websockets
 * Connect websockets (verification)
 * User A calls user B
 * User B accepts call
 * User A sends ICE candidates to user B
 * User B sends ICE candidates to user A
 * User A hangs up on user B
*/

// Test the creation of users
it('Create user A', (done) => {
    createUser(done, userA);
});

it('Create user B', (done) => {
    createUser(done, userB);
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
    connectWebsocket(done, wsClientA, userA);
});

it('Establish Client Connection - Client B', (done) => {
    connectWebsocket(done, wsClientB, userB);
});

// Test Client A Calling Client B
it('Client A Calling Client B', (done) => {
    callUser(done, wsClientA, wsClientB, userA, userB);
});

// Test accepting the call
it('Client B Accept Call', (done) => {
    respondCall(done, "accept", wsClientA, wsClientB, userA, userB);
});

// Test client A sending ICE candidates to client B
it('Client A Sending ICE Candidate to Client B', (done) => {
    sendIceCandidate(done, wsClientB, wsClientA, userB, userA);
});

// Test client B sending ICE candidates to client A
it('Client B Sending ICE Candidate to Client A', (done) => {
    sendIceCandidate(done, wsClientB, wsClientA, userB, userA);
});

// Test client A hang up on client B
it('Client A Hang Up on Client B', (done) => {
    hangUp(done, wsClientA, wsClientB, userA, userB);
});
