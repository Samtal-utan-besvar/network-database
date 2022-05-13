const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');

// Environment variables
chai.use(chaiHttp);

const userA = new user('No', 'Ideas', 'Lasdasdeft');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 


TESTS:
 * Create user
 * Wrong data format
 * Empty field
 * Missing field
 * To many fields
 * Wrong field name
 * Wrong password format
 * SQL Injection
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Put password with wrong data format
it('User A modify password (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testPutPassword(userA.token, userRequest, 'Request is Missing Field: email', done);
});

// Put password with empty field
it('User A modify password (Empty Field)', (done) => {
    var userRequest = {
        "email": "",
        "new_password": ""
    }

    testPutPassword(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Put password with missing field
it('User A modify password (Missing Field)', (done) => {
    var userRequest = {
    }

    testPutPassword(userA.token, userRequest, 'Request is Missing Field: email', done);
});

// Put password with to many fields
it('User A modify password (To Many Fields)', (done) => {
    var userRequest = {
        "email": userA.email,
        "new_password": "aPerfectPassword",
        "DOSAttempt": "Payload"
    }

    testPutPassword(userA.token, userRequest, 'Illegal Request', done);
});

// Put password with wrong field name
it('User A modify password (Wrong Field Name)', (done) => {
    var userRequest = {
        "email": userA.email,
        "ThisIsWrong": "aRandomPassword"
    }

    testPutPassword(userA.token, userRequest, 'Request is Missing Field: new_password', done);
});

// Put password with wrong password format
it('User A modify password (Wrong Name Format)', (done) => {
    var userRequest = {
        "email": userA.email,
        "new_password": "123"
    }

    testPutPassword(userA.token, userRequest, 'Invalid Password Size, 8 characters required', done);
});

// Put password with SQL injection
it('User A modify password (SQL Injection)', (done) => {
    var userRequest = {
        "DELETE FROM CONTACTS;": phoneNumber
    }

    testPutPassword(userA.token, userRequest, 'Illegal Request', done);
});

// Standardized put password request with callback on done()
function testPutPassword(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .put('/put_password')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}