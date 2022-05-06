const httpServer = require('../../setup/main.js').httpServer;
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const getUserData = require('./getUserData');

// Environment variables
chai.use(chaiHttp);

function putPhonenumber(done, userMain, phoneNumber) {
    userMain.phoneNumber = phoneNumber
    var userRequest = {
        "phonenumber": userMain.phoneNumber
    }

    chai.request(httpServer)
        .put('/put_phonenumber')
        .set('authorization', userMain.token)
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            // Make sure user has new phonenumber
            getUserData(done, userMain);
        });
}

module.exports = putPhonenumber;