const authenticateModule = require('../jwt/jwtAuth');
const generateAccessToken = authenticateModule.generateAccessToken;
const verifyNoneEmpty = require('./routeValidity').verifyNoneEmpty;
const sanitize = require('./routeValidity').sanitize;
const handleError = require('./routeValidity').handleError;
const bcrypt = require('bcrypt');
const pool = require('../db');

const saltRounds = 10;
const dataLimit = 128;

function createUser(req, res, next) {
    try {
        // Check so no values are empty
        if (!verifyNoneEmpty(req.body)) {
            var error = new Error('Empty Fields in Request');
            error.name = 'Defined';
            throw error;
        }

        // Check if request meets sanitize requirements (field amount, data size)
        if (!sanitize(req.body, dataLimit, 5)) {
            var error = new Error('Illegal Request');
            error.name = 'Defined';
            throw error;
        }

        const { firstname, lastname, phone_number, email, password } = req.body;

        // Check if email already exists (Async)
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

                        if (result.rows.length != 0) {
                            var err = new Error('Email Already in Use');
                            err.name = 'Defined';
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                )
            });
        }

        // Check if phonenumber already exists (Async)
        const checkPhoneNumber = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT phone_number 
                        FROM USERS 
                        WHERE phone_number = $1`,
                    [phone_number], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rows.length != 0) {
                            var err = new Error('Phone Number Already in Use');
                            err.name = 'Defined';
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Querry database to add user
        const addUser = () => {
            return new Promise((resolve, reject) => {

                // Salt and hash password
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        pool.query(
                            `INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash) 
                            VALUES($1, $2, $3, $4, $5)`,
                            [firstname, lastname, phone_number, email, hash], (err, result) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                if (result.rowCount != 1) {
                                    var error = new Error('Error Adding User');
                                    error.name = 'Defined';
                                    reject(error);
                                    return;
                                }

                                resolve();
                            }
                        );
                    });
                });
            })
        }

        function returnAccessToken() {
            const access_token = generateAccessToken({ 'email': email });
            res.json(access_token);
        }
        
        // Make sure validity checks (async) are run before adding user
        checkEmail()
            .then(data => {
                checkPhoneNumber()
                    .then(data => {
                        addUser()
                            .then(data => {
                                returnAccessToken();
                        })
                        .catch(err => {
                            handleError(err, res);
                        })
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

// Login User
function login(req, res, next) {
    try {
        // Check so no values are empty
        if (!verifyNoneEmpty(req.body)) {
            var error = new Error('Empty Fields in Request');
            error.name = 'Defined';
            throw error;
        }

        // Check if request meets sanitize requirements (field amount, data size)
        if (!sanitize(req.body, dataLimit, 2)) {
            var error = new Error('Illegal Request');
            error.name = 'Defined';
            throw error;
        }

        const { email, password } = req.body;

        const loginRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT password_hash 
                        FROM USERS 
                        WHERE email = $1`,
                    [email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rows.length == 0) {
                            var err = new Error('No User Found');
                            err.name = 'Defined';
                            reject(err);
                            return;
                        }

                        bcrypt.compare(password, result.rows[0].password_hash, (err, result) => {
                            if (result) {
                                res.json(generateAccessToken({ 'email': email }));
                            } else {
                                var error = new Error('Wrong Login Credentials');
                                error.name = 'Defined';
                                reject(err);
                                return;
                            }
                        });

                        resolve();
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before logging in
        loginRequest()
            .then(data => {
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}
function addContact(req, res, next) {
    try {
        // Check so no values are empty
        if (!verifyNoneEmpty(req.body)) {
            var error = new Error('Empty Fields in Request');
            error.name = 'Defined';
            throw error;
        }

        // Check if request meets sanitize requirements (field amount, data size)
        if (!sanitize(req.body, dataLimit, 1)) {
            var error = new Error('Illegal Request');
            error.name = 'Defined';
            throw error;
        }

        const { contact_phonenumber } = req.body;

        const addContactRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `INSERT INTO CONTACTS (owner_id, contact_user_id) 
                        VALUES((SELECT user_id FROM USERS WHERE email = $1),
                               (SELECT user_id FROM USERS WHERE phone_number = $2))
                                EXCEPT
                                    SELECT owner_id, contact_user_id FROM CONTACTS`,
                    [req.user.email, contact_phonenumber], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rowCount != 1) {
                            var error = new Error('Unknown Phone Number Or User Already A Contact');
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before adding a contact
        addContactRequest()
            .then(data => {
                res.status(200).send('Contact Added!');
            })
            .catch(err => {
                handleError(err, res);
            })

    } catch (err) {
        handleError(err, res);
    }
}

module.exports.createUser = createUser;
module.exports.login = login;
module.exports.addContact = addContact;