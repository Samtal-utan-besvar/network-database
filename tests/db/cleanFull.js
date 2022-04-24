const chai = require('chai');
const chaiHttp = require('chai-http');
var user = require('../user');
const createUser = require('../unit/createUser');
const loginUser = require('../unit/loginUser');
const addContact = require('../unit/addContact');
const getContacts = require('../unit/getContacts');
const deleteContact = require('../unit/deleteContact');

// Environment variables
chai.use(chaiHttp);

// Create Users
var userA = new user('Cornelis', 'Vreeswijk', 'CeciliaLösenord');
var userB = new user('Ann', 'katarin', 'SäkertSomNatten');

/*
NOTES FOR TESTING

- If the tests for connection setup (and verification) fail, the other tests could time out
    due to dropped connection.

- Make sure to clear previous listeners after using the wsWebsocket.on()
and you want to make a new receive function.

- Don't forget to use done(); when finishing a test section, it().



TESTS:
 * Create 2 users
 * Login 2 users
 * Add contact 2 users
 * Get contacts 2 users
 * Delete contact
*/

// Test the creation of user A
it('Create User A', (done) => {
    createUser(done, userA);
});

// Test the creation of user B
it('Create User A', (done) => {
    createUser(done, userB);
});

// Test the login of user A
it('Login User', (done) => {
    loginUser(done, userA);
});

// Test the login of user B
it('Login User', (done) => {
    loginUser(done, userB);
});

// User A add contact user B
it('User A add contact user B', (done) => {
    addContact(done, userA, userB);
});

// User B add contact user A
it('User B add contact user A', (done) => {
    addContact(done, userB, userA);
});

// Get user A contacts
it('Get user A contacts', (done) => {
    getContacts(done, userA, userB);
});

// Get user B contacts
it('Get user B contacts', (done) => {
    getContacts(done, userB, userA);
});

// User A delete contact user B
it('User A delete contact user B', (done) => {
    deleteContact(done, userA, userB);
});