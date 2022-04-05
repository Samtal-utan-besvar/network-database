const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const pool = require('./db');

const port = 8080;
const saltRounds = 10;
const tokenExpireTime = 604800;   // 1 week (seconds)
var tokenSecret;

app.use(express.json());

// Read in the token secret from key
try {
    tokenSecret = fs.readFileSync('./keys/tokenSecret.key', 'utf8');

    // Remove first line
    tokenSecret = tokenSecret.split('\n').slice(1).join('\n');

    // Remove last 2 lines
    tokenSecret = tokenSecret.split('\n')
    tokenSecret.pop();
    tokenSecret.pop();
    tokenSecret = tokenSecret.join('\n');
} catch (err) {
    console.error(err)
}

process.env.TOKEN_SECRET = tokenSecret;

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: tokenExpireTime + 's' });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)

            return res.status(403).send('');
        } 

        // user is the payload of token
        req.user = user

        next();
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
                    `INSERT INTO USERS (firstname, lastname, phone_number, email, password_hash) 
                        VALUES($1, $2, $3, $4, $5)`,
                    [firstname, lastname, phone_number, email, hash]
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

//Authenticate User
app.get("/authenticate", authenticateToken, async (req, res) => {
    try {
        const newPayload = {
            'email': req.user.email
        }

        res.status(200).send(jwt.sign(newPayload, process.env.TOKEN_SECRET, { expiresIn: tokenExpireTime + 's' }));
    } catch (err) {
        console.log(err.message);
        res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
    }
});

//Add Contact
app.post("/add_contact", authenticateToken, async (req, res) => {
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
});

// Remove Contact

//Get Users Contact List
app.get("/get_contacts", authenticateToken, async (req, res) => {
    try {
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
});

//Delete contact
app.delete("/delete_contact", authenticateToken, async (req, res) => {
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
});

app.listen(port, () => {
    console.log("Server running on port: " + port);
});
