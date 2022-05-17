const fs = require('fs');
const jwt = require('jsonwebtoken');
const { handleError, throwError } = require('../validation/validate');

var tokenSecret;
const accessTokenExpireTime = 604800;   // 1 week (seconds)
const resetTokenExpireTime = 300;    // 5 min

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
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: accessTokenExpireTime + 's' });
}

function generatePasswordResetToken(payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: resetTokenExpireTime + 's' });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            handleError(err);
        }

        // user is the payload of token
        req.user = user
        next();
    })
}

// Authenticate websocket token
function authenticateWsToken(token, callback) {
    try {
        if (token == null) {
            throwError('Empty JWT Token');
        }

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                throwError('Invalid JWT Token');
            }

            callback(user.email);
        });
    } catch (err) {
        handleError(err);
    }
}

module.exports.authenticateToken = authenticateToken;
module.exports.authenticateWsToken = authenticateWsToken;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generatePasswordResetToken = generatePasswordResetToken;