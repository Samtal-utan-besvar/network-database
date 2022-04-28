const generateAccessToken = require('../jwt/jwtAuth').generateAccessToken;
const sanitize = require('../validation/validate').sanitize;
const handleError = require('../validation/validate').handleError;
const pool = require('../database/db');

const dataLimit = 128;

//Authenticate a user and return a new token
function authenticate(req, res, next) {
    try {
        // Check if request meets sanitize requirements (field amount, data size)
        sanitize(req.body, dataLimit, 0)

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
        // Check if request meets sanitize requirements (field amount, data size)
        sanitize(req.body, dataLimit, 0)

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
        // Check if request meets sanitize requirements (field amount, data size)
        sanitize(req.body, dataLimit, 0)

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

// Search for user based on number or name

module.exports.authenticate = authenticate;
module.exports.getUserData = getUserData;
module.exports.getContactList = getContactList;