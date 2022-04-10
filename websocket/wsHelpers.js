const handleError = require('../routes/routeValidity').handleError;

// Validate JSON fields inclusion
function validateJSONFields(json, expectFields, connection) {
    for (const field of expectFields) {
        if (!json.hasOwnProperty(field)) {
            var error = new Error('Missin Field: ' + String(field));
            error.name = 'Defined';
            throw error;

            return false
        }
    }

    return true;
}

// Validate the phonenumber
function validatePhonenumber(phonenumber, connection) {
    const valid = String(phonenumber)
        .toLowerCase()
        .match(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        );

    // warn client of invalid phonenumber
    if (!valid) {
        var error = new Error('Invalid Phonenumber: ' + String(phonenumber));
        error.name = 'Defined';
        throw error;
    }

    return valid;
}

// Validate the email
function validateEmail(email, connection) {
    const valid = String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )

    // warn client of invalid email
    if (!valid) {
        var error = new Error('Invalid Email: ' + String(email));
        error.name = 'Defined';
        throw error;
    }

    return valid;
}

// Validate the name
function validateName(name, connection) {
    const valid = String(name)
        .toLowerCase()
        .match(
            /^[a-zA-Z‰ˆÂƒ÷≈]+ [a-zA-Z‰ˆÂƒ÷≈]+$/
        )

    // warn client of invalid name
    if (!valid) {
        var error = new Error('Invalid Name: ' + String(name));
        error.name = 'Defined';
        throw error;
    }

    return valid;
}

module.exports.validateJSONFields = validateJSONFields;
module.exports.validatePhonenumber = validatePhonenumber;
module.exports.validateEmail = validateEmail;
module.exports.validateName = validateName;