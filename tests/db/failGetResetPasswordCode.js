const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const common = require('../common');

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
 * Wrong email format
 * SQL Injection
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Get reset code with wrong data format
it('User A get reset code (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testverifyResetPassword(userA.token, userRequest, 'Request is Missing Field: email', done);
});

// Get reset code with empty field
it('User A get reset code (Empty Field)', (done) => {
    var userRequest = {
        "email": ""
    }

    testverifyResetPassword(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Get reset code with missing field
it('User A get reset code (Missing Field)', (done) => {
    var userRequest = {
    }

    testverifyResetPassword(userA.token, userRequest, 'Request is Missing Field: email', done);
});

// Get reset code with to many fields
it('User A get reset code (To Many Fields)', (done) => {
    var userRequest = {
        "email": common.randomEmail(),
        "DOSAttempt": "Payload"
    }

    testverifyResetPassword(userA.token, userRequest, 'Illegal Request', done);
});

// Get reset code with wrong field name
it('User A get reset code (Wrong Field Name)', (done) => {
    var userRequest = {
        "ThisIsWrong": common.randomEmail()
    }

    testverifyResetPassword(userA.token, userRequest, 'Request is Missing Field: email', done);
});

// Get reset code with wrong email format
it('User A get reset code (Wrong Name Format)', (done) => {
    const email = "123ABC"
    var userRequest = {
        "email": email
    }

    testverifyResetPassword(userA.token, userRequest, 'Invalid Email: ' + email, done);
});

// Get reset code with SQL injection
it('User A get reset code (SQL Injection)', (done) => {
    var userRequest = {
        "DELETE FROM CONTACTS;": email
    }

    testverifyResetPassword(userA.token, userRequest, 'Illegal Request', done);
});

// Standardized get reset code request with callback on done()
function testverifyResetPassword(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .get('/get_reset_password_code')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}