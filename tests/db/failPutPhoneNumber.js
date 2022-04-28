const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');
const common = require('../common');

// Environment variables
chai.use(chaiHttp);

const userA = new user('No', 'Ideas', 'Left');
const userB = new user('Same', 'Old', 'Song');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 


TESTS:
 * Create 2 users
 * Login user
 * Wrong data format
 * Empty field
 * Missing field
 * To many fields
 * Wrong field name
 * Wrong phonenumber format
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Create user B
it('Create user B', (done) => {
    createUser(done, userB);
});

// Login user A
it('Login user A', (done) => {
    loginUser(done, userA);
});

// Put phonenumber with wrong data format
it('User A modify phonenumber (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testPutPhoneNumber(userA.token, userRequest, 'Request is Missing Field: phonenumber', done);
});

// Put phonenumber with empty field
it('User A modify phonenumber (Empty Field)', (done) => {
    var userRequest = {
        "phonenumber": ""
    }

    testPutPhoneNumber(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Put phonenumber with missing field
it('User A modify phonenumber (Missing Field)', (done) => {
    var userRequest = {
    }

    testPutPhoneNumber(userA.token, userRequest, 'Request is Missing Field: phonenumber', done);
});

// Put phonenumber with to many fields
it('User A modify phonenumber (To Many Fields)', (done) => {
    var userRequest = {
        "phonenumber": common.randomPhoneNumber(),
        "DOSAttempt": "Payload"
    }

    testPutPhoneNumber(userA.token, userRequest, 'Illegal Request', done);
});

// Put phonenumber with wrong field name
it('User A modify phonenumber (Wrong Field Name)', (done) => {
    var userRequest = {
        "ThisIsWrong": common.randomPhoneNumber()
    }

    testPutPhoneNumber(userA.token, userRequest, 'Request is Missing Field: phonenumber', done);
});

// Put phonenumber with wrong phonenumber format
it('User A modify phonenumber (Wrong Name Format)', (done) => {
    const phoneNumber = "123ABC"
    var userRequest = {
        "phonenumber": phoneNumber
    }

    testPutPhoneNumber(userA.token, userRequest, 'Invalid Phone Number: ' + phoneNumber, done);
});

// Put already taken phone number
it('User A modify phonenumber (User B Phone Number)', (done) => {
    var userRequest = {
        "phonenumber": userB.phoneNumber
    }

    testPutPhoneNumber(userA.token, userRequest, 'Phone Number Already Used', done);
});

// Standardized put phonenumber request with callback on done()
function testPutPhoneNumber(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .put('/put_phonenumber')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}