const httpServer = require('../../setup/main.js').httpServer;
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const getUserData = require('./getUserData');

// Environment variables
chai.use(chaiHttp);

function putFirstname(done, userMain, firstname) {
    userMain.firstname = firstname
    var userRequest = {
        "firstname": userMain.firstname
    }

    chai.request(httpServer)
        .put('/put_firstname')
        .set('authorization', userMain.token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            // Make sure user has new username
            getUserData(done, userMain);
        });
}

module.exports = putFirstname;