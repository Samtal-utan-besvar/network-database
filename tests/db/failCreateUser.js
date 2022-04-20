const assert = require('assert');
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const common = require('../common');

// Environment variables
chai.use(chaiHttp);

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

// Create user with wrong data format
it('Login user A (none-JSON)', (done) => {
    var userRequest = "Definitly not a JSON"

    testUserCreation(userRequest, 'Illegal Request', done);
});

// Create a user with an empty field
it('Create user A (empty field)', (done) => {
    var userRequest = {
        "firstname": "",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Empty Fields in Request', done);
});

// Create a user with missing field
it('Create user A (missing field)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Illegal Request', done);
});

// Create a user with to many fields
it('Create user A (to many fields)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "DOSAttempt": "payload",
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Illegal Request', done);
});

// Create a user with same email
it('Create user A (same email)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    const createUser = () => {
        return new Promise((resolve, reject) => {
            chai.request(httpServer)
                .post('/create_user')
                .send(userRequest)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res, res.text).to.have.status(200);
                    wsuserAToken = res.body
                    resolve();
                });
        })
    }

    createUser()
        .then(data => {
            userAPhoneNumber = common.randomPhoneNumber();
            var userRequest = {
                "firstname": "Albert",
                "lastname": "Johansson",
                "phone_number": userAPhoneNumber,
                "email": userAEmail,
                "password": "SuperSecure"
            }

            testUserCreation(userRequest, 'Email Already in Use', done);
        })
        .catch(err => {
            throw err;
        })
});

// Create a user with same phone number
it('Create user A (same phone number)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    const createUser = () => {
        return new Promise((resolve, reject) => {
            chai.request(httpServer)
                .post('/create_user')
                .send(userRequest)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res, res.text).to.have.status(200);
                    wsuserAToken = res.body
                    resolve();
                });
        })
    }

    createUser()
        .then(data => {
            userAEmail = common.randomEmail();
            var userRequest = {
                "firstname": "Albert",
                "lastname": "Johansson",
                "phone_number": userAPhoneNumber,
                "email": userAEmail,
                "password": "SuperSecure"
            }

            testUserCreation(userRequest, 'Phone Number Already in Use', done);
        })
        .catch(err => {
            throw err;
        })
});

// Standardized create user request with callback on done()
function testUserCreation(userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}