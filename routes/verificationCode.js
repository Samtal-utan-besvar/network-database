class verificationCode{
    constructor(email, verifyCode) {

        // Class Variables
        this.email = email;
        this.verifyCode = verifyCode;
        this.createdAt = Date.now();
        this.verifiedStatus = false;
    }
}

module.exports = verificationCode;