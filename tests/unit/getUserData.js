const httpServer = require('../../main.js').httpServer;
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function getUserData(done, user) {
    chai.request(httpServer)
        .get('/get_user')
        .set('authorization', user.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);
            assert.equal(res.body[0].firstname, user.firstname);
            assert.equal(res.body[0].lastname, user.lastname);
            assert.equal(res.body[0].phone_number, user.phoneNumber);
            assert.equal(res.body[0].email, user.email);
            done();
        });
}

module.exports = getUserData;

