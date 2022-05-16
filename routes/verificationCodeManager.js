const verificationCode = require('./verificationCode');

var resetPasswordCodes = [];    // List of currently valid codes
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const verifyCodeLifeSpan = 240000 // 4 min to verify

// Generate a code of random characters and integers
function generateCode(email) {
    var result = '';
    for (var i = 0; i < process.env.RESET_PASSWORD_CODE_LENGTH; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            characters.length));
    }

    resetPasswordCodes.push(new verificationCode(email, result));
    return result;
}

// Verify the reset password code if email and code is valid. (update verifiedStatus)
function verifyResetCode(email, verifyCodeAttempt) {
    var returnValue = false;

    resetPasswordCodes.forEach(function (verifyCodeObject) {
        if (email === verifyCodeObject.email) {
            if (verifyCodeAttempt == verifyCodeObject.verifyCode) {
                verifyCodeObject.verifiedStatus = true;
                returnValue = true;
            }
        }
    });

    return returnValue;
}

// return the verified status of a user
function getVerifiedStatus(email) {
    var returnValue = false;

    resetPasswordCodes.forEach(function (verifyCodeObject) {
        if (email === verifyCodeObject.email) {
            returnValue = true;
        }
    });

    return returnValue;
}

// Verification codes are stored and removed in chronological order
setInterval(function checkVerifyCodes() {
    resetPasswordCodes.forEach(function (verifyCode) {
        if (Date.now() - verifyCodeLifeSpan > verifyCode.createdAt) {
            resetPasswordCodes.shift()   // Remove first element
        }
    });
}, 1000)

module.exports.generateCode = generateCode;
module.exports.verifyResetCode = verifyResetCode;
module.exports.getVerifiedStatus = getVerifiedStatus;