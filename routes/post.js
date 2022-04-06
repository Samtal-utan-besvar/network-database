const authenticateModule = require('../jwt/jwtAuth');
const authenticateToken = authenticateModule.authenticateToken;
const generateAccessToken = authenticateModule.generateAccessToken;
const verifyNoneEmpty = require('./routeValidity').verifyNoneEmpty;
const sanitize = require('./routeValidity').sanitize;
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

        // Check if email already exists
        
        pool.query(
            `SELECT email 
                FROM USERS 
                WHERE email = $1`,
            [email], (err, result) => {
                if (err) {
                    return console.log('Error executing query: ' + err.stack);
                }

                if (result) {
                    var error = new Error('Email Already in Use');
                    error.name = 'Defined';
                    throw error;
                }
            }
        )

        // Check if phonenumber already exists
        //pool.query(
        //    `SELECT phone_number 
        //        FROM USERS 
        //        WHERE phone_number = $1`,
        //    [email], (err, result) => {
        //        if (err) {
        //            return console.log('Error executing query: ' + err.stack);
        //        }

        //        if (result) {
        //            var error = new Error('Phone Number Already in Use');
        //            error.name = 'Defined';
        //            throw error;
        //        }
        //    }
        //);

        const access_token = generateAccessToken({ 'email': email });

        // Salt is 72-Bytes, no use in storing on database
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                console.log(hash);
                pool.query(
                    `INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash) 
                        VALUES($1, $2, $3, $4, $5)`,
                    [firstname, lastname, phone_number, email, hash]
                );
            });
        });

        res.json(access_token);
    } catch (err) {
        if (process.env.ENV_VERBOSE) console.log('WARNING: ' + err.message);

        // Only return errors with 'Defined' as to not leak database or critical errors
        if (err.name == 'Defined') {
            res.status(422).send(err.message);
        } else {
            res.status(422).send('Looks like something went wrong... we\'re sorry!');
        }
    }
}

//Login User
function login(req, res, next) {
    try {
        if (!verifyNoneEmpty(req.body)) {
            if (process.env.ENV_VERBOSE) console.log("WARNING: Empty values found in request!");
            res.status(422).send("Empty Fields in Request");

            return;
        }

        const { email, password } = req.body;

        pool.query(
            `SELECT password_hash 
                FROM USERS 
                WHERE email = $1`,
            [email], (err, result) => {
                if (err) {
                    return console.log('Error executing query during login' + err.stack);
                }

                bcrypt.compare(password, result.rows[0].password_hash, (err, result) => {
                    if (result) {
                        res.status(200).send('Access Granted!');

                    } else {
                        res.status(401).send('Access Denied!');
                    }
                });
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}
function addContact(req, res, next) {
    try {
        if (!verifyNoneEmpty(req.body)) {
            if (process.env.ENV_VERBOSE) console.log("WARNING: Empty values found in request!");
            res.status(422).send("Empty Fields in Request");

            return;
        }

        const { contact_phonenumber } = req.body;

        pool.query(
            `INSERT INTO CONTACTS (owner_id, contact_user_id) 
                VALUES((SELECT user_id FROM USERS WHERE email = $1),
                       (SELECT user_id FROM USERS WHERE phone_number = $2))`,
            [req.user.email, contact_phonenumber], (err, result) => {
                if (err) {
                    return console.log('Error executing query during adding of contact' + err.stack);
                } else {
                    res.status(200).send('Contact Added!');
                }
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}

module.exports.createUser = createUser;
module.exports.login = login;
module.exports.addContact = addContact;