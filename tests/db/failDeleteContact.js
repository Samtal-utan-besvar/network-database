const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const randomPhoneNumber = require('../common').randomPhoneNumber;
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');
const addContact = require('../unit/addContact');

// Environment variables
chai.use(chaiHttp);

const userA = new user('Man', 'Yogurth', 'IsNasdasdice');
const userB = new user('Almost', 'Finished', 'Beasdasdaef');

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
 * User A add contact user B
 * Wrong data format
 * Empty field
 * Missing field
 * To many fields
 * Wrong phone number format
 * Delete missing contact
 * SQL Injection
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

// User A add contact user B
it('User A add Contact User B', (done) => {
    addContact(done, userA, userB);
});

// Delete contact with wrong data format
it('User A delete contact (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testDeleteContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Delete contact with empty field
it('User A delete contact (Empty Field)', (done) => {
    var userRequest = {
        "contact_phonenumber": ""
    }

    testDeleteContact(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Delete contact with missing field
it('User A delete contact (Missing Field)', (done) => {
    var userRequest = {
    }

    testDeleteContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Delete contact with to many fields
it('User A delete contact (To Many Fields)', (done) => {
    var userRequest = {
        "contact_phonenumber": userB.phoneNumber,
        "DOSAttempt": "Payload"
    }

    testDeleteContact(userA.token, userRequest, 'Illegal Request', done);
});

// Delete contact with wrong field name
it('User A delete contact (Wrong Field Name)', (done) => {
    var userRequest = {
        "ThisISWrong": userB.phoneNumber
    }

    testDeleteContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Delete contact with wrong phone number format
it('User A delete contact (Wrong Phone Number Format)', (done) => {
    const phoneNumber = "08sa6s776ss"
    var userRequest = {
        "contact_phonenumber": phoneNumber
    }

    testDeleteContact(userA.token, userRequest, 'Invalid Phone Number: ' + phoneNumber, done);
});

// Delete missing contact
it('User A delete contact (Missing Contact)', (done) => {
    const phoneNumber = randomPhoneNumber();
    var userRequest = {
        "contact_phonenumber": phoneNumber
    }

    testDeleteContact(userA.token, userRequest, 'Unknown Contact: ' + phoneNumber, done);
});

// Delete contact with SQL injection
it('User A delete contact (SQL Injection)', (done) => {
    var userRequest = {
        "SELECT * FROM users;": phoneNumber
    }

    testDeleteContact(userA.token, userRequest, 'Illegal Request', done);
});


// Standardized delete contact request with callback on done()
function testDeleteContact(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .delete('/delete_contact')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}