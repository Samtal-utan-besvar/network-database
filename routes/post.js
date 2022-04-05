const authenticateModule = require('../jwt/jwtAuth');
const authenticateToken = authenticateModule.authenticateToken;
const generateAccessToken = authenticateModule.generateAccessToken;
const bcrypt = require('bcrypt');
const pool = require('../db');

const saltRounds = 10;

function createUser(req, res, next){
    try {
        const { firstname, lastname, phone_number, email, password } = req.body;
        const access_token = generateAccessToken({ 'email': email });

        // Salt is 72-Bytes, no use in storing on database
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                pool.query(
                    `INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash) 
                        VALUES($1, $2, $3, $4, $5)`,
                    [firstname, lastname, phone_number, email, hash]
                );
            });
        });

        res.json(access_token);
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}

//Login User
function login(req, res, next) {
    try {
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