const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const app = express();
const pool = require('./db');

const port = 18468;
const saltRounds = 10;

app.use(express.json());

process.env.TOKEN_SECRET = 'testing';

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.status(403).send('');

        req.user = user

        next()
    })
}

// ROUTES //

//Create User
app.post("/create_user", async (req, res) => {
    try {
        const { firstname, lastname, phone_number, email, password } = req.body;
        const access_token = generateAccessToken({'email': email});

        // Salt is 72-Bytes, no use in storing on database
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                pool.query(
                    `INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash, access_token) 
                        VALUES($1, $2, $3, $4, $5, $6)`,
                    [firstname, lastname, phone_number, email, hash, access_token]
                );
            });
        });

        res.json(access_token);
        //res.status(201).send('User ' + firstname + " " + lastname + " was added!");
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
});

//Add Contact
app.post("/add_contact", authenticateToken, async (req, res) => {
    try {
        const { owner_phonenumber, contact_phonenumber } = req.body;
        
        pool.query(
            `INSERT INTO CONTACTS (owner_id, contact_user_id) 
                VALUES((SELECT user_id FROM USERS WHERE phone_number = $1),
                       (SELECT user_id FROM USERS WHERE phone_number = $2))`,
            [owner_phonenumber, contact_phonenumber], (err, result) => {
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
});

// Remove Contact

//Get Users Contact List
app.get("/get_contacts", async (req, res) => {
    try {
        const { phone_number } = req.body;

        pool.query(
            `SELECT u.phone_number, u.firstname, u.lastname 
                FROM CONTACTS c 
                INNER JOIN USERS u ON c.contact_user_id = u.user_id 
                WHERE c.owner_id = (SELECT user_id FROM USERS WHERE phone_number = $1)`,
            [phone_number], (err, result) => {
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
});

//Delete contact
app.delete("/delete_contact", async (req, res) => {
    try {
        var userId;
        const { owner_phonenumber, contact_phonenumber } = req.body;
        
        pool.query(
            `DELETE FROM CONTACTS 
                WHERE owner_id = (SELECT user_id FROM USERS WHERE phone_number = $1) 
                AND contact_user_id = (SELECT user_id FROM USERS WHERE phone_number = $2)`,
            [owner_phonenumber, contact_phonenumber], (err, result) => {
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
});

app.listen(port, () => {
    console.log("Server running on port: " + port);
});
