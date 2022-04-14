const assert = require('assert');
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var server = require('../../main.js');

// Environment variables
chai.use(chaiHttp);

var clientA;
var clientAToken;
var clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
var clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().
 
*/

// Create a user with an empty field
it('Create user A (empty field)', (done) => {
    var userRequest = {
        "firstname": "",
        "lastname": "Johansson",
        "phone_number": clientAPhoneNumber,
        "email": clientAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Empty Fields in Request', done);
});

// Create a user with missing field
it('Create user A (missing field)', (done) => {
    clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
    clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

    var userRequest = {
        "lastname": "Johansson",
        "phone_number": clientAPhoneNumber,
        "email": clientAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Illegal Request', done);
});

// Create a user with to many fields
it('Create user A (to many fields)', (done) => {
    clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
    clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

    var userRequest = {
        "DOSAttempt": "payload",
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": clientAPhoneNumber,
        "email": clientAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Illegal Request', done);
});

// Create a user with same email
it('Create user A (same email)', (done) => {
    clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
    clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

    var userRequest = {
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": clientAPhoneNumber,
        "email": clientAEmail,
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
                    wsClientAToken = res.body
                    resolve();
                });
        })
    }

    createUser()
        .then(data => {
            clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();
            var userRequest = {
                "firstname": "Albert",
                "lastname": "Johansson",
                "phone_number": clientAPhoneNumber,
                "email": clientAEmail,
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
    clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
    clientAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

    var userRequest = {
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": clientAPhoneNumber,
        "email": clientAEmail,
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
                    wsClientAToken = res.body
                    resolve();
                });
        })
    }

    createUser()
        .then(data => {
            clientAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
            var userRequest = {
                "firstname": "Albert",
                "lastname": "Johansson",
                "phone_number": clientAPhoneNumber,
                "email": clientAEmail,
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