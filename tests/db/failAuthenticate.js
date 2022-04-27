const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');

// Environment variables
chai.use(chaiHttp);

const userA = new user('Moonshadow', 'Moonshadow', 'Followed');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().



TESTS:
 * Create user
 * Login user
 * To many fields
*/

// Create user A
it('Create user A', (done) => {
    createUser(done, userA);
});

// Login user A
it('Login user A', (done) => {
    loginUser(done, userA);
});

// Get contacts with to many fields
it('User A authenticate (To Many Fields)', (done) => {
    var userRequest = {
        "DosAttempt": "Payload"
    }

    testAuthenticate(userA.token, userRequest, 'Illegal Request', done);
});

// Standardized create user request with callback on done()
function testAuthenticate(token, userRequest, expectedErrorText, done) {
    chai.request(httpServer)
        .get('/authenticate')
        .set('authorization', token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(422);
            expect(res.error.text).to.equal(expectedErrorText);
            done();
        });
}