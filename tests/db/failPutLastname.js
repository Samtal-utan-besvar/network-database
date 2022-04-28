const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');

// Environment variables
chai.use(chaiHttp);

const userA = new user('friest', 'seicond', 'theird');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 


TESTS:
 * Create a user
 * Login user
 * Wrong data format
 * Empty field
 * Missing field
 * To many fields
 * Wrong field name
 * Wrong lastname format
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Login user A
it('Login user A', (done) => {
    loginUser(done, userA);
});

// Put lastname with wrong data format
it('User A modify lastname (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testPutLastname(userA.token, userRequest, 'Request is Missing Field: lastname', done);
});

// Put lastname with empty field
it('User A modify lastname (Empty Field)', (done) => {
    var userRequest = {
        "lastname": ""
    }

    testPutLastname(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Put lastname with missing field
it('User A modify lastname (Missing Field)', (done) => {
    var userRequest = {
    }

    testPutLastname(userA.token, userRequest, 'Request is Missing Field: lastname', done);
});

// Put lastname with to many fields
it('User A modify lastname (To Many Fields)', (done) => {
    var userRequest = {
        "lastname": userA.lastname,
        "DOSAttempt": "Payload"
    }

    testPutLastname(userA.token, userRequest, 'Illegal Request', done);
});

// Put lastname with wrong field name
it('User A modify lastname (Wrong Field Name)', (done) => {
    var userRequest = {
        "ThisIsWrong": userA.lastname
    }

    testPutLastname(userA.token, userRequest, 'Request is Missing Field: lastname', done);
});

// Put lastname with wrong name format
it('User A modify lastname (Wrong Name Format)', (done) => {
    const lastname = "123ABC"
    var userRequest = {
        "lastname": lastname
    }

    testPutLastname(userA.token, userRequest, 'Invalid Name: ' + lastname, done);
});

// Standardized put lastname request with callback on done()
function testPutLastname(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .put('/put_lastname')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}