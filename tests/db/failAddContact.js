const assert = require('assert');
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const common = require('../common');

// Environment variables
chai.use(chaiHttp);

var userAToken;
const userAFirstName = 'some';
const userALastName = 'name';
const userAPassword = 'superSecure'
const userAEmail = common.randomEmail();
const userAPhoneNumber = common.randomPhoneNumber();

var userBToken;
const userBFirstName = 'first';
const userBLastName = 'last';
const userBPassword = 'superSecure2'
const userBEmail = common.randomEmail();
const userBPhoneNumber = common.randomPhoneNumber();

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

// Test the creation of user B
it('Create user B', (done) => {
    var userRequest = {
        "firstname": userBFirstName,
        "lastname": userBLastName,
        "phone_number": userBPhoneNumber,
        "email": userBEmail,
        "password": userBPassword
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userBToken = res.body
            done();
        });
});

// Login user with wrong data format
it('Login user A (none-JSON)', (done) => {
    var userRequest = "Definitly not a JSON"

    testUserLogin(userRequest, 'Illegal Request', done);
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