const httpServer = require('../../main.js').httpServer;
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const getUserData = require('./getUserData');

// Environment variables
chai.use(chaiHttp);

function putLastname(done, userMain, lastname) {
    userMain.lastname = lastname
    var userRequest = {
        "lastname": userMain.lastname
    }

    chai.request(httpServer)
        .put('/put_lastname')
        .set('authorization', userMain.token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            // Make sure user has new username
            getUserData(done, userMain);
        });
}

module.exports = putLastname;