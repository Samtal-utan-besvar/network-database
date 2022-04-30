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
 


TESTS:
 * Wrong data format
 * Empty field
 * Missing Field
 * To many fields
 * Wrong field name
 * Wrong firstname format
 * Wrong lastname format
 * Wrong email format
 * Wrong phone number
 * Same email
 * Same phone number
 * SQL Injection
*/

// Create user with wrong data format
it('Create user A (none-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testUserCreation(userRequest, 'Request is Missing Field: firstname', done);
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

    testUserCreation(userRequest, 'Request is Missing Field: firstname', done);
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

// Create a user with wrong field name
it('Create user A (wrong field name)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "Albert",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "emal": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Request is Missing Field: email', done);
});

// Create a user with wrong format firstname
it('Create user A (wrong format firstname, numbers)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "123512asd",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Invalid Name: 123512asd', done);
});

// Create a user with wrong format lastname
it('Create user A (wrong format lastname, numbers)', (done) => {
    userAEmail = common.randomEmail();
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "Per",
        "lastname": "21312asd",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Invalid Name: 21312asd', done);
});

// Create a user with wrong format email
it('Create user A (wrong format email)', (done) => {
    email = "DefinitlyNotValid@."
    userAPhoneNumber = common.randomPhoneNumber();

    var userRequest = {
        "firstname": "Per",
        "lastname": "efternamn",
        "phone_number": userAPhoneNumber,
        "email": email,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Invalid Email: ' + email, done);
});

// Create a user with wrong format phone number
it('Create user A (wrong format phone number)', (done) => {
    userAEmail = common.randomEmail();
    phoneNumber = "asd9198391";

    var userRequest = {
        "firstname": "Per",
        "lastname": "efternamn",
        "phone_number": phoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Invalid Phone Number: ' + phoneNumber, done);
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

// Create a user with an sql injection
it('Create user A (SQL Injection)', (done) => {
    var userRequest = {
        "firstname": "SELECT * FROM users;",
        "lastname": "Johansson",
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": "SuperSecure"
    }

    testUserCreation(userRequest, 'Illegal Request', done);
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