const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function createUser(done, user) {
    var userRequest = {
        "firstname": user.firstname,
        "lastname": user.lastname,
        "phone_number": user.phoneNumber,
        "email": user.email,
        "password": user.password
    }

    chai.request(httpServer)
        .post('/create_user')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            user.token = res.body;    // Set token
            done();
        });
}

module.exports = createUser;