const httpServer = require('../../main.js').httpServer;
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function getContacts(done, userMain, userContact) {
    chai.request(httpServer)
        .get('/get_contacts')
        .set('authorization', userMain.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, userContact.firstname);
            assert.equal(res.body[0].lastname, userContact.lastname);
            assert.equal(res.body[0].phone_number, userContact.phoneNumber);
            done();
        });
}

module.exports = getContacts;

