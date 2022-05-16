const httpServer = require('../../setup/main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function loginUser(done, user) {
    var userRequest = {
        "email": user.email,
        "password": user.password
    }

    chai.request(httpServer)
        .post('/login')
        .send(userRequest)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            user.token = res.body;    // Set token
            done();
        });
}

module.exports = loginUser;