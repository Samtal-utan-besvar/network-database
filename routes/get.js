const generateAccessToken = require('../jwt/jwtAuth').generateAccessToken;
const validate = require('../validation/validate');
const validateLimit = validate.validateLimit;
const handleError = require('../validation/validate').handleError;
const emailManager = require('../email/emailManager');
const pool = require('../database/db');
const verificationCodeManager = require('./verificationCodeManager');
const jwtAuth = require('../jwt/jwtAuth');

//Authenticate a user and return a new token
function authenticate(req, res, next) {
    try {
        // Check if request meets validateLimit requirements (field amount, data size)
        validateLimit(req.body, 0)

        const newPayload = {
            'email': req.user.email
        }

        res.status(200).send(generateAccessToken(newPayload));
    } catch (err) {
        handleError(err, res);
    }
}

//Get users information except id and password
function getUserData(req, res, next) {
    try {
        // Check if request meets validateLimit requirements (field amount, data size)
        validateLimit(req.body, 0)

        // Request all contacts (Async)
        const requestContacts = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT phone_number, firstname, lastname, email
                        FROM USERS
                        WHERE email = $1`,
                    [req.user.email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            resolve(result.rows);
                        }
                    }
                );
            });
        }

        requestContacts()
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

//Get Users Contact List
function getContactList(req, res, next) {
    try {
        // Check if request meets validateLimit requirements (field amount, data size)
        validateLimit(req.body, 0)

        // Request all contacts (Async)
        const requestContacts = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT u.phone_number, u.firstname, u.lastname, u.email
                        FROM CONTACTS c 
                        INNER JOIN USERS u ON c.contact_user_id = u.user_id 
                        WHERE c.owner_id = (SELECT user_id FROM USERS WHERE email = $1)`,
                    [req.user.email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            resolve(result.rows);
                        }
                    }
                );
            });
        }

        requestContacts()
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

//Get Verfication Code to Reset Password (sent through user's email)
function getResetPasswordCode(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body);

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['email']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 1);

        const {email} = req.body;

        // Check if email is valid format
        validate.validateEmail(email)

        // Check if email belongs to a registered user (Async)
        const checkEmail = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT email 
                        FROM USERS 
                        WHERE email = $1`,
                    [email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rows.length != 1) {
                            var err = new Error('Email is not a Registered User');
                            err.name = 'Defined';
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                )
            });
        }

        // Make sure validity checks (async) are run before adding user
        checkEmail()
            .then(data => {
                const verifyCode = verificationCodeManager.generateCode(email);
                emailManager.sendPasswordChangeEmail(email, verifyCode);

                res.status(200).send("Reset Code Sent")
            })
            .catch(err => {
                handleError(err, res);
            })
    } catch (err) {
        handleError(err, res);
    }
}

//Verify the Reset Password Code Given in Email. (mark verify code as verified and allow password reset until timer)
function verifyPasswordResetCode(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body);

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['email', 'verify_code']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 2);

        const { email, verify_code } = req.body;

        // Check if email is valid format
        validate.validateEmail(email)

        // Check if email belongs to a registered user (Async)
        const checkEmail = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT email 
                        FROM USERS 
                        WHERE email = $1`,
                    [email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rows.length != 1) {
                            var err = new Error('Email is not a Registered User');
                            err.name = 'Defined';
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                )
            });
        }

        // Make sure validity checks (async) are run before adding user
        checkEmail()
            .then(data => {
                const result = verificationCodeManager.verifyResetCode(email, verify_code);
                if (result) {
                    const resetToken = jwtAuth.generatePasswordResetToken({
                        'email': email
                    });
                    res.status(200).send(resetToken)
                } else {
                    validate.throwError("Invalid Verification Code");
                }
            })
            .catch(err => {
                handleError(err, res);
            })
    } catch (err) {
        handleError(err, res);
    }
}

module.exports.authenticate = authenticate;
module.exports.getUserData = getUserData;
module.exports.getContactList = getContactList;
module.exports.getResetPasswordCode = getResetPasswordCode;
module.exports.verifyPasswordResetCode = verifyPasswordResetCode;