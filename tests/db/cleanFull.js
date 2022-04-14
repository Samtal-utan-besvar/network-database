const assert = require('assert');
const createWebsocket = require('../common.js').createWebsocket;
const waitForSocketConnection = require('../common.js').waitForSocketConnection;
const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
var server = require('../../main.js');

// Environment variables
chai.use(chaiHttp);

var userAToken;
const userAFirstName = 'some';
const userALastName = 'name';
const userAPassword = 'superSecure'
const userAEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
const userAPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

var userBToken;
const userBFirstName = 'first';
const userBLastName = 'last';
const userBPassword = 'superSecure2'
const userBEmail = (Math.random() + 1).toString(36).substring(2) + "@domain.test";
const userBPhoneNumber = Math.round(Math.random() * (8999999999) + 1000000000).toString();

// Test the creation of user A
it('Create user A', (done) => {
    var userRequest = {
        "firstname": userAFirstName,
        "lastname": userALastName,
        "phone_number": userAPhoneNumber,
        "email": userAEmail,
        "password": userAPassword
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userAToken = res.body
            done();
        });
});

// Test the creation of user B
it('Create user B', (done) => {
    var userRequest = {
        "firstname": userBFirstName,
        "lastname": userBLastName,
        "phone_number": userBPhoneNumber,
        "email": userBEmail,
        "password": userBPassword
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userBToken = res.body
            done();
        });
});

// Login user A
it('Login user A', (done) => {
    var userRequest = {
        "email": userAEmail,
        "password": userAPassword
    }

    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userAToken = res.body
            done();
        });
});

// Login user B
it('Login user B', (done) => {
    var userRequest = {
        "email": userBEmail,
        "password": userBPassword
    }

    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            userBToken = res.body
            done();
        });
});

// User A add contact user B
it('User A add contact user B', (done) => {
    var userRequest = {
        "contact_phonenumber": userBPhoneNumber
    }

    chai.request(httpServer)
        .post('/add_contact')
        .set('authorization', userAToken)
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
        "contact_phonenumber": userAPhoneNumber
    }

    chai.request(httpServer)
        .post('/add_contact')
        .set('authorization', userBToken)
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
        .set('authorization', userAToken)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, userBFirstName);
            assert.equal(res.body[0].lastname, userBLastName);
            assert.equal(res.body[0].phone_number, userBPhoneNumber);
            done();
        });
});

// Get user B contacts
it('Get user B contacts', (done) => {
    chai.request(httpServer)
        .get('/get_contacts')
        .set('authorization', userBToken)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, userAFirstName);
            assert.equal(res.body[0].lastname, userALastName);
            assert.equal(res.body[0].phone_number, userAPhoneNumber);
            done();
        });
});

// User A delete contact user B
it('User A delete contact user B', (done) => {
    var userRequest = {
        "contact_phonenumber": userBPhoneNumber
    }

    chai.request(httpServer)
        .delete('/delete_contact')
        .send(userRequest)
        .set('authorization', userAToken)
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
        .set('authorization', userAToken)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res.body).to.deep.equal([]);
            expect(res, res.text).to.have.status(200);
            done();
        });
});