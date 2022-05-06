const nodemailer = require('nodemailer');
const JSDOM = require('jsdom').JSDOM;
const logger = require('../logger/common');
const pageLoader = require('../pages/loader');
const { google } = require("googleapis");
const { handleError } = require('../validation/validate');
const OAuth2 = google.auth.OAuth2;

var transporter;

// Setup the transporter for sending emails
function setupTransporter() {
    const OAuth2Client = new OAuth2(
        process.env.SMTP_CLIENT_ID,
        process.env.SMTP_CLIENT_SECRET
    );

    OAuth2Client.setCredentials({
        refresh_token: process.env.SMTP_REFRESH
    });
    const accessToken = OAuth2Client.getAccessToken();

    // Create a SMTP transporter object
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: (process.env.SMTP_SECURE === 'true'),
        auth: {
            type: "OAuth2",
            user: process.env.SMTP_USER,
            clientId: process.env.SMTP_CLIENT_ID,
            clientSecret: process.env.SMTP_CLIENT_SECRET,
            refreshToken: process.env.SMTP_REFRESH,
            accessToken: accessToken
        }
    });
}

// Create a message object with header information and a html object
function createMessage(fromName, toEmail, subject, htmlObject) {
    return message = {
        from: fromName + ' <samtalutanbesvar@random.com>',
        to: 'Recipient <' + toEmail + '>',
        subject: subject,
        html: htmlObject
    };
}

// Inserts verification code into DOM object. Beware, parsers strips away BOM
function insertVerificationCode(domtext, verificationCode) {
    var document = new JSDOM(domtext),
        target = document.window.document.getElementById("verificationCode");

    target.textContent = verificationCode

    var new_document = document.serialize();
    return new_document;
}

// Send email to change user's password
function sendPasswordChangeEmail(email, verifyCode) {
    var htmlMessage = insertVerificationCode(pageLoader.files.changePasswordHtml, verifyCode);
    createMessage('SUB - Support', email, 'Ändring av Ditt Lösenord', htmlMessage);

    transporter.sendMail(message, (err, info) => {
        if (err) {
            handleError(err);
        }
    });
}

// Verify that the transporter is setup correctly
function verifyEmailTransporter(callback) {
    transporter.verify(function (error, success) {
        if (error) {
            handleError(error);
        } else {
            logger.printHeader("Email Transporter Settings");
            console.log("Nodemail Initialized: " + process.env.SMTP_HOST + ":" + process.env.SMTP_PORT);
            console.log("Server User Account: " + process.env.SMTP_USER);
            console.log("Secure Setting: " + process.env.SMTP_SECURE + "\n");

            callback();
        }
    });
}

module.exports.setupTransporter = setupTransporter;
module.exports.verifyEmailTransporter = verifyEmailTransporter;
module.exports.sendPasswordChangeEmail = sendPasswordChangeEmail;