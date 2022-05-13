const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');

// Environment variables
chai.use(chaiHttp);

const userA = new user('Fancy', 'Pants', 'Tablespoon');

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
 * Wrong email
 * Wrong password
 * Same email
 * Same phone number
 * SQL Injection
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Login user with wrong data format
it('Login user A (none-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testUserLogin(userRequest, 'Request is Missing Field: email', done);
});

// Login user with empty field
it('Login user A (Empty Field)', (done) => {
    var userRequest = {
        "email": "",
        "password": userA.password
    }

    testUserLogin(userRequest, 'Empty Fields in Request', done);
});

// Login user with missing field
it('Login user A (Missing Field)', (done) => {
    var userRequest = {
        "password": userA.password
    }

    testUserLogin(userRequest, 'Request is Missing Field: email', done);
});

// Login user with to many fields
it('Login user A (To Many Field)', (done) => {
    var userRequest = {
        "email": userA.email,
        "password": userA.password,
        "DOS": "DOSAttempt"
    }

    testUserLogin(userRequest, 'Illegal Request', done);
});

// Login user with wrong field name
it('Login user A (Wrong Field Name)', (done) => {
    var userRequest = {
        "emailThisIsWrong": userA.email,
        "password": userA.password
    }

    testUserLogin(userRequest, 'Request is Missing Field: email', done);
});

// Login user with wrong email format
it('Login user A (Wrong Email Format)', (done) => {
    const email = "illegal@.com"
    var userRequest = {
        "email": email,
        "password": userA.password
    }

    testUserLogin(userRequest, 'Invalid Email: ' + email, done);
});

// Login user with wrong email
it('Login user A (Wrong Email)', (done) => {
    var userRequest = {
        "email": userA.email + "Fail",
        "password": userA.password,
    }

    testUserLogin(userRequest, 'No User Found', done);
});

// Login user with wrong password
it('Login user A (Wrong Password)', (done) => {
    var userRequest = {
        "email": userA.email,
        "password": userA.password + "Fail",
    }

    testUserLogin(userRequest, 'Wrong Login Credentials', done);
});

// Login user with SQL injection
it('Login user A (SQL Injection)', (done) => {
    var userRequest = {
        "email": userA.email,
        "DELETE FROM CONTACTS;": userA.password,
    }

    testUserLogin(userRequest, 'Illegal Request', done);
});


// Standardized login user request with callback on done()
function testUserLogin(userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}