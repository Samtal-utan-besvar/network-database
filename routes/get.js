const authenticateModule = require('../jwt/jwtAuth');
const authenticateToken = authenticateModule.authenticateToken;
const generateAccessToken = authenticateModule.generateAccessToken;
const verifyNoneEmpty = require('./routeValidity').verifyNoneEmpty;
const pool = require('../db');

function authenticate(req, res, next) {
    try {
        if (!verifyNoneEmpty(req.body)) {
            if (process.env.ENV_VERBOSE) console.log("WARNING: Empty values found in request!");
            res.status(422).send("Empty Fields in Request");

            return;
        }

        const newPayload = {
            'email': req.user.email
        }

        res.status(200).send(generateAccessToken(newPayload));
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}

//Get Users Contact List
function getContactList(req, res, next) {
    try {
        if (!verifyNoneEmpty(req.body)) {
            if (process.env.ENV_VERBOSE) console.log("WARNING: Empty values found in request!");
            res.status(422).send("Empty Fields in Request");

            return;
        }

        pool.query(
            `SELECT u.phone_number, u.firstname, u.lastname 
                FROM CONTACTS c 
                INNER JOIN USERS u ON c.contact_user_id = u.user_id 
                WHERE c.owner_id = (SELECT user_id FROM USERS WHERE email = $1)`,
            [req.user.email], (err, result) => {
                if (err) {
                    return console.log('Error executing query during adding of contact' + err.stack);
                } else {
                    res.status(200).send(result.rows);
                }
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}

module.exports.authenticate = authenticate;
module.exports.getContactList = getContactList;