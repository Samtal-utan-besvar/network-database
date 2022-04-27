const common = require('./common');

class user{
    // Private variables
    firstname;
    lastname;
    password;
    phoneNumber = common.randomPhoneNumber();
    email = common.randomEmail();
    token;

    constructor(firstname, lastname, password) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.password = password;
    }
}

module.exports = user;