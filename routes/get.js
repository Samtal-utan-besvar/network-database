const generateAccessToken = require('../jwt/jwtAuth').generateAccessToken;
const validateNoneEmpty = require('../validation/validate').validateNoneEmpty;
const sanitize = require('../validation/validate').sanitize;
const handleError = require('../validation/validate').handleError;
const pool = require('../db');

const dataLimit = 128;

function authenticate(req, res, next) {
    try {
        // Check so no values are empty
        validateNoneEmpty(req.body)

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

//Get Users Contact List
function getContactList(req, res, next) {
    try {
        // Check so no values are empty
        validateNoneEmpty(req.body)

        // Check if request meets sanitize requirements (field amount, data size)
        sanitize(req.body, dataLimit, 0)

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