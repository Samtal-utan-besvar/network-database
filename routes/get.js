const generateAccessToken = require('../jwt/jwtAuth').generateAccessToken;
const verifyNoneEmpty = require('./routeValidity').verifyNoneEmpty;
const sanitize = require('./routeValidity').sanitize;
const handleError = require('./routeValidity').handleError;
const pool = require('../db');

const dataLimit = 128;

function authenticate(req, res, next) {
    try {
        // Check so no values are empty
        if (!verifyNoneEmpty(req.body)) {
            var error = new Error('Empty Fields in Request');
            error.name = 'Defined';
            throw error;
        }

        // Check if request meets sanitize requirements (field amount, data size)
        if (!sanitize(req.body, dataLimit, 0)) {
            var error = new Error('Illegal Request');
            error.name = 'Defined';
            throw error;
        }

        const newPayload = {
            'email': req.user.email
        }

        res.status(200).send(generateAccessToken(newPayload));
    } catch (err) {
        handleError(err, res);
    }
}

//Get Users Contact List
function getContactList(req, res, next) {
    try {
        // Check so no values are empty
        if (!verifyNoneEmpty(req.body)) {
            var error = new Error('Empty Fields in Request');
            error.name = 'Defined';
            throw error;
        }

        // Check if request meets sanitize requirements (field amount, data size)
        if (!sanitize(req.body, dataLimit, 0)) {
            var error = new Error('Illegal Request');
            error.name = 'Defined';
            throw error;
        }

        // Request all contacts (Async)
        const requestContacts = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `SELECT u.phone_number, u.firstname, u.lastname 
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

module.exports.authenticate = authenticate;
module.exports.getContactList = getContactList;