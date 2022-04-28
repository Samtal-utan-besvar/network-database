const validate = require('../validation/validate');
const pool = require('../database/db');

const dataLimit = 128;

function deleteContact (req, res, next) {
    try {
        // Check so no values are empty
        validate.validateNoneEmpty(req.body)

        // Check so all required fields are in request
        validate.validateJSONFields(req.body, ['contact_phonenumber']);

        // Check if request meets sanitize requirements (field amount, data size)
        validate.sanitize(req.body, dataLimit, 1)

        const { contact_phonenumber } = req.body;

        // Check if phone number is valid format
        validate.validatePhonenumber(contact_phonenumber)

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
                            var error = new Error('Unknown Contact: ' + contact_phonenumber);
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
                validate.handleError(err, res);
            })

    } catch (err) {
        validate.handleError(err, res);
    }
}

module.exports.deleteContact = deleteContact;