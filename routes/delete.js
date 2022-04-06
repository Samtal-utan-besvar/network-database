﻿const authenticateModule = require('../jwt/jwtAuth');
const authenticateToken = authenticateModule.authenticateToken;
const pool = require('../db');

function deleteContact (req, res, next) {
    try {
        const { contact_phonenumber } = req.body;

        pool.query(
            `DELETE FROM CONTACTS 
                WHERE owner_id = (SELECT user_id FROM USERS WHERE email = $1) 
                AND contact_user_id = (SELECT user_id FROM USERS WHERE phone_number = $2)`,
            [req.user.email, contact_phonenumber], (err, result) => {
                if (err) {
                    return console.log('Error executing query during adding of contact' + err.stack);
                } else {
                    res.status(200).send('Deleted Contact!');
                }
            }
        );


    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
}

module.exports.deleteContact = deleteContact;