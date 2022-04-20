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