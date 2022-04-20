const assert = require('assert');
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const common = require('../common');
var user = require('../user');
const createUser = require('../unit/createUser');

// Environment variables
chai.use(chaiHttp);

var userA = new user('This', 'is', 'getting');
var userB = new user('aBit', 'Repetative', 'iThink');

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
    createUser(userA);
});

// Test the creation of user B
it('Create user B', (done) => {
    createUser(userB);
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