const verifyNoneEmpty = require('./routeValidity').verifyNoneEmpty;
const sanitize = require('./routeValidity').sanitize;
const handleError = require('./routeValidity').handleError;
const pool = require('../db');

const dataLimit = 128;

function deleteContact (req, res, next) {
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

        const { contact_phonenumber } = req.body;

        const deleteContactRequest = () => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `DELETE FROM CONTACTS 
                        WHERE owner_id = (SELECT user_id FROM USERS WHERE email = $1) 
                        AND contact_user_id = (SELECT user_id FROM USERS WHERE phone_number = $2)`,
                    [req.user.email, contact_phonenumber], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (result.rowCount != 1) {
                            var error = new Error('Unknown Contact');
                            error.name = 'Defined';
                            reject(error);
                            return;
                        }

                        resolve('Deleted Contact!');
                    }
                );
            });
        }

        // Make sure validity checks (async) are run before deleting a contact
        deleteContactRequest()
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

module.exports.deleteContact = deleteContact;