const authenticateModule = require('../jwt/authenticate');
const authenticateToken = authenticateModule.authenticateToken;
const generateAccessToken = authenticateModule.generateAccessToken;
const pool = require('../db');

//Authenticate User
function getRoutes(app) {
    app.get("/authenticate", authenticateToken, async (req, res) => {
        try {
            const newPayload = {
                'email': req.user.email
            }

            res.status(200).send(generateAccessToken(newPayload));
        } catch (err) {
            console.log(err.message);
            res.status(422).send('Invalid Data ¯\_(ツ)_/¯');
        }
    });

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
}

module.exports = getRoutes;