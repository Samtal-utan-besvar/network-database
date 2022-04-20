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
    var userRequest = {
        "email": userA.email,
        "password": userA.password
    }

    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            userA.token = res.body;    // Set token
            done();
        });
});

// Test the login of user B
it('Login User', (done) => {
    var userRequest = {
        "email": userB.email,
        "password": userB.password
    }

    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            userB.token = res.body;    // Set token
            done();
        });
});

// User A add contact user B
it('User A add contact user B', (done) => {
    var userRequest = {
        "contact_phonenumber": userB.phoneNumber
    }

    chai.request(httpServer)
        .post('/add_contact')
        .set('authorization', userA.token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            done();
        });
});

// User B add contact user A
it('User B add contact user A', (done) => {
    var userRequest = {
        "contact_phonenumber": userA.phoneNumber
    }

    chai.request(httpServer)
        .post('/add_contact')
        .set('authorization', userB.token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            done();
        });
});

// Get user A contacts
it('Get user A contacts', (done) => {
    chai.request(httpServer)
        .get('/get_contacts')
        .set('authorization', userA.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, userB.firstname);
            assert.equal(res.body[0].lastname, userB.lastname);
            assert.equal(res.body[0].phone_number, userB.phoneNumber);
            done();
        });
});

// Get user B contacts
it('Get user B contacts', (done) => {
    chai.request(httpServer)
        .get('/get_contacts')
        .set('authorization', userB.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, userA.firstname);
            assert.equal(res.body[0].lastname, userA.lastname);
            assert.equal(res.body[0].phone_number, userA.phoneNumber);
            done();
        });
});

// User A delete contact user B
it('User A delete contact user B', (done) => {
    var userRequest = {
        "contact_phonenumber": userB.phoneNumber
    }

    chai.request(httpServer)
        .delete('/delete_contact')
        .send(userRequest)
        .set('authorization', userA.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            done();
        });
});

// Make sure user A contact list does no longer have user B
it('Verify delete of contact user B', (done) => {
    chai.request(httpServer)
        .get('/get_contacts')
        .set('authorization', userA.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res.body).to.deep.equal([]);
            expect(res, res.text).to.have.status(200);
            done();
        });
});