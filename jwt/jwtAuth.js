const fs = require('fs');
const jwt = require('jsonwebtoken');

var tokenSecret;
const tokenExpireTime = 604800;   // 1 week (seconds)

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
    console.log("ERROR: Missing key for token secret, please add one!");
    console.error(err)
}

process.env.TOKEN_SECRET = tokenSecret;

function generateAccessToken(payload) {
    //console.log(payload);
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

// Asynchronous
function authenticateWsToken(token, callback) {
    if (token == null) {
        var err = new Error('Empty JWT Tken');
        err.name = 'Defined';
        throw err;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            var err = new Error('Invalid JWT Token');
            err.name = 'Defined';
            throw err;
        }

        callback(user.email);
    });
}

module.exports.authenticateToken = authenticateToken;
module.exports.authenticateWsToken = authenticateWsToken;
module.exports.generateAccessToken = generateAccessToken;