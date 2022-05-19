const handleError = require('../validation/validate').handleError;
const pool = require('../database/db');
const validate = require('../validation/validate');
const verificationCodeManager = require('./verificationCodeManager');
const bcrypt = require('bcryptjs');

function putFirstname(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['firstname']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 1)

        const { firstname } = req.body;

        // Check if firstname is valid format
        validate.validateName(firstname)

        const putFirstnameRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `UPDATE users
                        SET firstname = $2
                        WHERE email = $1`,
                    [req.user.email, firstname], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before updating the firstname. None currently
        putFirstnameRequest()
            .then(data => {
                res.status(200).send('Firstname Modified!');
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

function putLastname(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['lastname']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 1)

        const { lastname } = req.body;

        // Check if lastname is valid format
        validate.validateName(lastname)

        const putLastnameRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `UPDATE users
                        SET lastname = $2
                        WHERE email = $1`,
                    [req.user.email, lastname], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before updating the lastname. None currently
        putLastnameRequest()
            .then(data => {
                res.status(200).send('Lastname Modified!');
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

function putPhonenumber(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['phonenumber']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 1)

        const { phonenumber } = req.body;

        // Check if phonenumber is valid format
        validate.validatePhonenumber(phonenumber)

        // Make sure the phonenumber is not already taken
        const checkPhonenumberExists = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT phone_number 
                        FROM USERS
                        WHERE phone_number = $1`,
                    [phonenumber], (err, result) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }

                        if (result.rowCount > 0) {
                            var error = new Error('Phone Number Already Used');
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        const putPhonenumberRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `UPDATE USERS
                        SET phone_number = $2
                        WHERE email = $1`,
                    [req.user.email, phonenumber], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before updating the phonenumber
        checkPhonenumberExists()
            .then(data => {
                putPhonenumberRequest()
                    .then(data => {
                        res.status(200).send('Phonenumber Modified!');
                    })
                    .catch(err => {
                        handleError(err, res);
                    })
            })
            .catch(err => {
                handleError(err, res);
            })
    } catch (err) {
        handleError(err, res);
    }
}

function putPassword(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['email', 'new_password']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 2)

        const { email, new_password } = req.body;

        // Check if email is valid format
        validate.validateEmail(email)

        // Check if password is valid format
        validate.validatePassword(new_password);

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

        // Update Password
        const putPasswordRequest = () => {
            return new Promise((resolve, reject) => {

                // Salt and hash password
                bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), function (err, salt) {
                    bcrypt.hash(new_password, salt, function (err, hash) {
                        pool.query(
                            `UPDATE users
                                SET password_hash = $2
                                WHERE email = $1`,
                            [email, hash], (err, result) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (result.rowCount != 1) {
                                    var error = new Error('Error Updating Password');
                                    error.name = 'Defined';
                                    reject(error);
                                    return;
                                }

                                resolve();
                            }
                        );
                    });
                });
            });
        }

        // Make sure validity checks (async) are run before updating the password
        checkEmail()
            .then(data => {
                if (verificationCodeManager.getVerifiedStatus(email)) {
                    putPasswordRequest()
                        .then(data => {
                            res.status(200).send('Password Changed!');
                        })
                        .catch(err => {
                            handleError(err, res);
                        })
                } else {
                    validate.throwError('Verify Code has NOT been Validated');
                }
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

module.exports.putFirstname = putFirstname;
module.exports.putLastname = putLastname;
module.exports.putPhonenumber = putPhonenumber;
module.exports.putPassword = putPassword;