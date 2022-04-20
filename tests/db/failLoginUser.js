const assert = require('assert');
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const common = require('../common');

// Environment variables
chai.use(chaiHttp);

const userAFirstName = 'first';
const userALastName = 'last';
const userAPassword = 'superSecure2'
var userAEmail = common.randomEmail();
var userAPhoneNumber = common.randomPhoneNumber();

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 
*/

// Create user A
it('Create user A', (done) => {
    var userRequest = {
        "firstname": userAFirstName,
        "lastname": userALastName,
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": userAPassword
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userAToken = res.body
            done();
        });
});

// Login user with wrong data format
it('Login user A (none-JSON)', (done) => {
    var userRequest = "Definitly not a JSON"

    testUserLogin(userRequest, 'Illegal Request', done);
});

// Login user with empty field
it('Login user A (Empty Field)', (done) => {
    var userRequest = {
        "email": "",
        "password": userAPassword
    }

    testUserLogin(userRequest, 'Empty Fields in Request', done);
});

// Login user with missing field
it('Login user A (Missing Field)', (done) => {
    var userRequest = {
        "password": userAPassword
    }

    testUserLogin(userRequest, 'Illegal Request', done);
});

// Login user with to many fields
it('Login user A (To Many Field)', (done) => {
    var userRequest = {
        "email": userAEmail,
        "password": userAPassword,
        "DOS": "DOSAttempt"
    }

    testUserLogin(userRequest, 'Illegal Request', done);
});

// Login user with wrong email
it('Login user A (Wrong Email)', (done) => {
    var userRequest = {
        "email": userAEmail + "Fail",
        "password": userAPassword,
    }

    testUserLogin(userRequest, 'No User Found', done);
});

// Login user with wrong password
it('Login user A (Wrong Password)', (done) => {
    var userRequest = {
        "email": userAEmail,
        "password": userAPassword + "Fail",
    }

    testUserLogin(userRequest, 'Wrong Login Credentials', done);
});

// Standardized create user request with callback on done()
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