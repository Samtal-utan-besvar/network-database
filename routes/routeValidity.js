require('dotenv').config({ path: './config.env' });

// Check if fields in json are empty
function verifyNoneEmpty(request) {
    for (entry in request) {
        if (request[entry] == null || request[entry] == "") return false;
    }

    return true;
}

// Sanitize data lengths and expected json field amount
function sanitize(request, dataLimit, expectedFieldAmount) {
    // Check data sizes
    for (entry in request) {
        if (request[entry].length > dataLimit || request.length > dataLimit) {
            return false;
        }
    }

    // Check expected field amount
    if (Object.keys(request).length != expectedFieldAmount) return false;

    return true;
}

// Propperly handle the erros caused during a request
function handleError(err, res) {
    if (process.env.VERBOSE == true) console.log('WARNING: ' + err.message);

    // Only return errors with 'Defined' as to not leak database or critical errors
    if (err.name == 'Defined' && res) {
        res.status(422).send(err.message);
    } else if(res) {
        res.status(422).send('Looks like something went wrong... we\'re sorry!');
    }
}

module.exports.verifyNoneEmpty = verifyNoneEmpty;
module.exports.sanitize = sanitize;
module.exports.handleError = handleError;