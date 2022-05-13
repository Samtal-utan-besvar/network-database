const validate = require('./validate')

const blacklist = [
    "*", ";", "delete", "insert", "from", "put", "where"
]

function sanitize(req, res, next) {
    try {
        // Check data sizes
        for (const key in req.body) {
            if (key.length > process.env.MAX_STRING_SIZE || req.body[key].length > process.env.MAX_STRING_SIZE) {
                validate.throwError('Illegal Request');
            }
        }

        // Check blacklisted characters
        for (const [key, value] of Object.entries(req.body)) {
            checkBlackListChar(key.toLocaleLowerCase(), blacklist);
            checkBlackListChar(value.toLocaleLowerCase(), blacklist);
        }
        next();
    } catch (err) {
        validate.handleError(err, res);
    }
}

function checkBlackListChar(checkString, blacklist) {
    for (const entry of blacklist) {
        if (checkString.includes(entry)) {
            validate.throwError('Illegal Request');
        }
    }
    
}

module.exports = sanitize;