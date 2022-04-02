const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const pg = require('pg');
const pool = require('./db');

const port = 18468;
const saltRounds = 10;

app.use(express.json());

// ROUTES //

//Create User
app.post("/create_user", async (req, res) => {
    try {
        const { firstname, lastname, phone_number, email, password } = req.body;

        // Salt is 72-Bytes, no use in storing on database
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                pool.query(
                    "INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash) VALUES ($1, $2, $3, $4, $5)",
                    [firstname, lastname, phone_number, email, hash]
                );
            });
        });
        
        res.status(201).send('User ' + firstname + " " + lastname + " was added!");
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
});

//Login User
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        pool.query(
            "SELECT password_hash FROM USERS WHERE email = $1",
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
});

//Add Contact
// Why oh god does it not have a way to save values returned to an outside scope?
// TODO: combine user_id SELECT query?
app.post("/add_contact", async (req, res) => {
    try {
        const { owner_phonenumber, contact_phonenumber } = req.body;
        // Get owner user_id
        pool.query(
            "SELECT user_id FROM USERS WHERE phone_number = $1",
            [owner_phonenumber], (err, result) => {
                if (err) {
                    return console.log('Error executing query during adding of contact' + err.stack);
                } else {
                    let ownerId = result.rows[0].user_id;

                    // Get contact user_id
                    pool.query(
                        "SELECT user_id FROM USERS WHERE phone_number = $1",
                        [contact_phonenumber], (err, result) => {
                            if (err) {
                                return console.log('Error executing query during adding of contact' + err.stack);
                            } else {
                                let contactId = result.rows[0].user_id;

                                // Add contact entry
                                pool.query(
                                    "INSERT INTO CONTACTS (owner_id, contact_user_id) VALUES ($1, $2)",
                                    [ownerId, contactId], (err, result) => {
                                        if (err) {
                                            return console.log('Error executing query during adding of contact' + err.stack);
                                        } else {
                                            res.status(200).send('Contact Added!');
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
});

// Remove Contact

//Get Users Contact List
app.get("/get_contacts", async (req, res) => {
    try {
        var userId;

        const { phone_number } = req.body;
        // Get user_id
        pool.query(
            "SELECT user_id FROM USERS WHERE phone_number = $1",
            [phone_number], (err, result) => {
                if (err) {
                    return console.log('Error executing query during adding of contact' + err.stack);
                } else {
                    userId = result.rows[0].user_id;

                    pool.query(
                        "SELECT u.phone_number, u.firstname, u.lastname FROM CONTACTS c INNER JOIN USERS u ON c.contact_user_id = u.user_id WHERE c.owner_id = $1",
                        [userId], (err, result) => {
                            if (err) {
                                return console.log('Error executing query during adding of contact' + err.stack);
                            } else {
                                res.status(200).send(result.rows);
                            }
                        }
                    );
                }
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
});

app.listen(port, () => {
    console.log("Server running on port: " + port);
});
