const common = require('./common');

class user{
    constructor(firstname, lastname, password) {

        // Class Variables
        this.firstname = firstname;
        this.lastname = lastname;
        this.password = password;
        this.phoneNumber = common.randomPhoneNumber();
        this.email = common.randomEmail();
        this.token = "";
    }
}

module.exports = user;