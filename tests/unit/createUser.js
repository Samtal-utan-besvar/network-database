const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function createUser(done, userA) {
    var userRequest = {
        "firstname": userA.firstname,
        "lastname": userA.lastname,
        "phone_number": userA.phoneNumber,
        "email": userA.email,
        "password": userA.password
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            userA.token = res.body;    // Set token
            done();
        });
}

module.exports = createUser;