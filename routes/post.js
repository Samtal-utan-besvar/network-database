const authenticateModule = require('../jwt/jwtAuth');
const generateAccessToken = authenticateModule.generateAccessToken;
const handleError = require('../validation/validate').handleError;
const bcrypt = require('bcryptjs');
const pool = require('../database/db');
const validate = require('../validation/validate');

const saltRounds = 10;

function createUser(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body);

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['firstname', 'lastname', 'phone_number', 'email', 'password']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 5);

        const { firstname, lastname, phone_number, email, password } = req.body;

        // Check if firstname is valid format
        validate.validateName(firstname)

        // Check if lastname is valid format
        validate.validateName(lastname)

        // Check if phone number is valid format
        validate.validatePhonenumber(phone_number)

        // Check if email is valid format
        validate.validateEmail(email)

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
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['email', 'password']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 2)

        const { email, password } = req.body;

        // Check if email is valid format
        validate.validateEmail(email)

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
                                resolve();
                            } else {
                                var err = new Error('Wrong Login Credentials');
                                err.name = 'Defined';
                                reject(err);
                                return;
                            }
                        });
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

// Add a contact
function addContact(req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['contact_phonenumber']);

        // Check if request meets validateLimit requirements (field amount, data size)
        validate.validateLimit(req.body, 1)

        const { contact_phonenumber } = req.body;

        // Check if phone number is valid format
        validate.validatePhonenumber(contact_phonenumber)

        // Make sure the contact exists
        const checkContactExists = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT phone_number FROM USERS WHERE phone_number = $1`,
                    [contact_phonenumber], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rowCount == 0) {
                            var error = new Error('Unknown Phone Number: ' + contact_phonenumber);
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        if (result.rowCount > 1) {
                            var error = new Error('Duplicate Phone Numbers Found');
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

        // Check if user is not adding itself as contact
        const checkContactNotSelf = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT phone_number FROM USERS WHERE email = $1`,
                    [req.user.email], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rows[0]['phone_number'] == contact_phonenumber) {
                            var error = new Error('Can Not Add Yourself as Contact');
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        resolve();
                    }
                );
            });
        }

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

                        if (result.rowCount == 0) {
                            var error = new Error('Contact Already Added');
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
        checkContactExists()
            .then(data => {
                checkContactNotSelf()
                    .then(data => {
                        addContactRequest()
                            .then(data => {
                                res.status(200).send('Contact Added!');
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

module.exports.createUser = createUser;
module.exports.login = login;
module.exports.addContact = addContact;