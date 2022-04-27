require('dotenv').config({ path: './config.env' });

// Validate JSON fields inclusion
function validateJSONFields(json, expectFields) {
    for (const field of expectFields) {
        if (!json.hasOwnProperty(field)) {
            throwError('Request is Missing Field: ' + field);
        }
    }
}

// Check if fields in json are empty
function validateNoneEmpty(request) {
    for (entry in request) {
        if (request[entry] == null || request[entry] == "") {
            throwError('Empty Fields in Request');
        }
    }
}

// Sanitize data lengths and expected json field amount
function sanitize(request, dataLimit, expectedFieldAmount) {
    // Check data sizes
    for (entry in request) {
        if (request[entry].length > dataLimit || request.length > dataLimit) {
            throwError('Illegal Request');
        }
    }

    // Check expected field amount
    if (Object.keys(request).length != expectedFieldAmount) {
        throwError('Illegal Request');
    }
}

// Validate the phonenumber
function validatePhonenumber(phonenumber) {
    const valid = String(phonenumber)
        .toLowerCase()
        .match(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        );

    // warn client of invalid phonenumber
    if (!valid) {
        throwError('Invalid Phone Number: ' + String(phonenumber));
    }

    return valid;
}

// Validate the email
function validateEmail(email) {
    const valid = String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )

    // warn client of invalid email
    if (!valid) {
        throwError('Invalid Email: ' + String(email));
    }

    return valid;
}

// Validate the name
function validateName(name) {
    const valid = String(name)
        .toLowerCase()
        .match(
            /^[a-z���]+$/
        )

    // warn client of invalid name
    if (!valid) {
        throwError('Invalid Name: ' + String(name));
    }

    return valid;
}

// Propperly handle the erros caused during a request
function handleError(err, res) {
    if (process.env.VERBOSE == true) console.log('WARNING: ' + err.message);

    // Only return errors with 'Defined' as to not leak database or critical errors
    if (err.name == 'Defined' && res) {
        res.status(422).send(err.message);
    } else if (res) {
        res.status(422).send('Looks like something went wrong... we\'re sorry! (Developer here, did you check so the request format is valid?)');
    }
}

// Create an error
function throwError(description) {
    var error = new Error(description);
    error.name = 'Defined';
    throw error;
}

module.exports.validateNoneEmpty = validateNoneEmpty;
module.exports.sanitize = sanitize;
module.exports.handleError = handleError;
module.exports.validateJSONFields = validateJSONFields;
module.exports.validatePhonenumber = validatePhonenumber;
module.exports.validateEmail = validateEmail;
module.exports.validateName = validateName;