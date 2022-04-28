const handleError = require('../validation/validate').handleError;
const pool = require('../database/db');
const validate = require('../validation/validate');

const dataLimit = 128;

function putFirstname(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['firstname']);

        // Check if request meets sanitize requirements (field amount, data size)
        validate.sanitize(req.body, dataLimit, 1)

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

        // Make sure validity checks (async) are run before adding a contact. None currently
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

        // Check if request meets sanitize requirements (field amount, data size)
        validate.sanitize(req.body, dataLimit, 1)

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

        // Make sure validity checks (async) are run before adding a contact. None currently
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

        // Check if request meets sanitize requirements (field amount, data size)
        validate.sanitize(req.body, dataLimit, 1)

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

        // Make sure validity checks (async) are run before adding a contact. None currently
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

module.exports.putFirstname = putFirstname;
module.exports.putLastname = putLastname;
module.exports.putPhonenumber = putPhonenumber;