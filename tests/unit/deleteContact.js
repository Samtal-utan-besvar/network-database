const httpServer = require('../../main.js').httpServer;
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

// Environment variables
chai.use(chaiHttp);

function deleteContact(done, userMain, userContact) {
    var userRequest = {
        "contact_phonenumber": userContact.phoneNumber
    }

    chai.request(httpServer)
        .delete('/delete_contact')
        .send(userRequest)
        .set('authorization', userMain.token)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res, res.text).to.have.status(200);

            // Verify that the contact is deleted
            chai.request(httpServer)
                .get('/get_contacts')
                .set('authorization', userMain.token)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.body).to.deep.equal([]);
                    expect(res, res.text).to.have.status(200);

                    done();
                });
        });
}

module.exports = deleteContact;