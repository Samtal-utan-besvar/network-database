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

const userA = new user('This', 'is', 'aaaagetting');
const userB = new user('aBit', 'Repetative', 'aaaaiThink');

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
 * Wrong phone number format
 * Add self
 * Add missing contact
 * Add contact
 * Add same contact
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

// Add contact with wrong data format
it('User A add contact B (non-JSON)', (done) => {
    var userRequest = new ArrayBuffer(8);

    testAddContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Add Contact with empty field
it('User A add contact B (Empty Field)', (done) => {
    var userRequest = {
        "contact_phonenumber": ""
    }

    testAddContact(userA.token, userRequest, 'Empty Fields in Request', done);
});

// Add Contact with missing field
it('User A add contact B (Missing Field)', (done) => {
    var userRequest = {
    }

    testAddContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Add Contact with to many fields
it('User A add contact B (To Many Fields)', (done) => {
    var userRequest = {
        "contact_phonenumber": userB.phoneNumber,
        "DOSAttempt": "Payload"
    }

    testAddContact(userA.token, userRequest, 'Illegal Request', done);
});

// Add Contact with wrong field name
it('User A add contact B (Wrong Field Name)', (done) => {
    var userRequest = {
        "thisFeelsWrong": userB.phoneNumber
    }

    testAddContact(userA.token, userRequest, 'Request is Missing Field: contact_phonenumber', done);
});

// Add Contact with wrong phone number format
it('User A add contact B (Wrong Phone Number Format)', (done) => {
    const phoneNumber = "08sa6s776ss"
    var userRequest = {
        "contact_phonenumber": phoneNumber
    }

    testAddContact(userA.token, userRequest, 'Invalid Phone Number: ' + phoneNumber, done);
});

// Add self
it('User A add contact itself (Itself)', (done) => {
    var userRequest = {
        "contact_phonenumber": userA.phoneNumber
    }

    testAddContact(userA.token, userRequest,  'Can Not Add Yourself as Contact', done);
});

// Add missing contact
it('User A add missing contact (Missing Contact)', (done) => {
    const phoneNumber = randomPhoneNumber();
    var userRequest = {
        "contact_phonenumber": phoneNumber
    }

    testAddContact(userA.token, userRequest, 'Unknown Phone Number: ' + phoneNumber, done);
});

// Add contact
it('User A add contact B (Successful)', (done) => {
    addContact(done, userA, userB);
});

// Add same contact
it('User A add contact B again (Contact Already Added)', (done) => {
    var userRequest = {
        "contact_phonenumber": userB.phoneNumber
    }

    testAddContact(userA.token, userRequest, 'Contact Already Added', done);
});

// SQL injection
it('User A add contact B (SQL Injection)', (done) => {
    var userRequest = {
        "contact_phonenumber": "SELECT * FROM users;"
    }

    testAddContact(userA.token, userRequest, 'Illegal Request', done);
});

// Standardized add contact user request with callback on done()
function testAddContact(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .post('/add_contact')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}