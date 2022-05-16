const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');

// Environment variables
chai.use(chaiHttp);

const userA = new user('friest', 'seicond', 'theiasdasdrd');

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
 * Wrong firstname format
 * SQL Injection
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Login user A
it('Login user A', (done) => {
    loginUser(done, userA);
});

// Put firstname with wrong data format
it('User A modify firstname (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testPutFirstname(userA.token, userRequest, 'Request is Missing Field: firstname', done);
});

// Put firstname with empty field
it('User A modify firstname (Empty Field)', (done) => {
    var userRequest = {
        "firstname": ""
    }

    testPutFirstname(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Put firstname with missing field
it('User A modify firstname (Missing Field)', (done) => {
    var userRequest = {
    }

    testPutFirstname(userA.token, userRequest, 'Request is Missing Field: firstname', done);
});

// Put firstname with to many fields
it('User A modify firstname (To Many Fields)', (done) => {
    var userRequest = {
        "firstname": userA.firstname,
        "DOSAttempt": "Payload"
    }

    testPutFirstname(userA.token, userRequest, 'Illegal Request', done);
});

// Put firstname with wrong field name
it('User A modify firstname (Wrong Field Name)', (done) => {
    var userRequest = {
        "ThisIsWrong": userA.firstname
    }

    testPutFirstname(userA.token, userRequest, 'Request is Missing Field: firstname', done);
});

// Put firstname with wrong name format
it('User A modify firstname (Wrong Name Format)', (done) => {
    const firstname = "123ABC"
    var userRequest = {
        "firstname": firstname
    }

    testPutFirstname(userA.token, userRequest, 'Invalid Name: ' + firstname, done);
});

// Put firstname with SQL injection
it('User A modify firstname (SQL Injection)', (done) => {
    var userRequest = {
        "firstname": "SELET * FROM contacts;"
    }

    testPutFirstname(userA.token, userRequest, 'Illegal Request', done);
});

// Standardized put firstname request with callback on done()
function testPutFirstname(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .put('/put_firstname')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}