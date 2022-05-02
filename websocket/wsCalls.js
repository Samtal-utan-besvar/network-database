const jwtAuth = require('../jwt/jwtAuth');
const validate = require('../validation/validate');
const handleError = validate.handleError;
const pool = require('../database/db');

// Asynchronous connect function
function connect(conn, JSONMessage, clients) {
    try {
        jwtAuth.authenticateWsToken(JSONMessage['TOKEN'], function (email) {
            validate.validateEmail(email)

            // Add client and send response if valid request
            pool.query(
                `SELECT phone_number FROM USERS WHERE email = $1`,
                [email], (err, result) => {
                    try {
                        if (err) {
                            var error = new Error('Invalid User');
                            error.name = 'Defined';
                            throw error;
                        } else {
                            if (!result.rows[0]) {
                                var error = new Error('User Does not Exist');
                                error.name = 'Defined';
                                throw error;

                                return; // End request
                            }

                            // Add connection, possibly replacing the old one.
                            clients[result.rows[0]['phone_number']] = {
                                'CONNECTION': conn,
                                'STATUS': 'free'
                            };

                            conn.send(JSON.stringify({
                                'RESPONSE': 'Connected'
                            }))

                            if (process.env.VERBOSE == 'true') console.log("COMMON: User With Phone Number " + result.rows[0]['phone_number'] + " Has Connected.");
                        }
                    } catch (err) {
                        handleError(err);
                    }
                }
            );
        });
    } catch (err) {
        handleError(err);
    }
}

function call(conn, JSONMessage, clients) {
    var validRequest = true

    try {
        // Check if verified client exists
        if (!(clients[JSONMessage['SENDER_PHONE_NUMBER']] && clients[JSONMessage['RECEIVER_PHONE_NUMBER']])) {
            var error = new Error('Caller or Contact Is Not a Verified Active Connection');
            error.name = 'Defined';
            throw error;

            return; // End request
        }

        // Check if users are already in a call
        if (clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] != 'free' || clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] != 'free') {
            var error = new Error('User Not Free');
            error.name = 'Defined';
            throw error;

            validRequest = false;
        }

        // Validate if required fields are in the JSON
        validate.validateJSONFields(JSONMessage, ['SENDER_PHONE_NUMBER', 'RECEIVER_PHONE_NUMBER', 'SDP']);

        // Validate phonenumber with RegEx, send back error if failed
        validate.validatePhonenumber(JSONMessage['SENDER_PHONE_NUMBER', 'RECEIVER_PHONE_NUMBER']);

        // Send message to the client with the phonenumber
        if (validRequest) {
            clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));
            clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] = 'calling'

            conn.send(JSON.stringify({
                'RESPONSE': 'Call Placed'
            }))

            if (process.env.VERBOSE == 'true') console.log("COMMON: " + JSONMessage['SENDER_PHONE_NUMBER'] + " Is Calling " + JSONMessage['RECEIVER_PHONE_NUMBER'] + ".");
        }
    } catch (err) {
        handleError(err);
    }   
}

function callResponse(conn, JSONMessage, clients) {
    try {
        // Check if verified client exists
        if (!(clients[JSONMessage['SENDER_PHONE_NUMBER']] && clients[JSONMessage['RECEIVER_PHONE_NUMBER']])) {
            var error = new Error('Caller or Contact Is Not a Verified Active Connection');
            error.name = 'Defined';
            throw error;

            return; // End request
        }

        // Validate if required fields are in the JSON
        validate.validateJSONFields(JSONMessage, ['RESPONSE', 'RECEIVER_PHONE_NUMBER', 'SENDER_PHONE_NUMBER'], conn);

        if (JSONMessage['RESPONSE'] == 'accept') {
            validate.validateJSONFields(JSONMessage, ['SDP'], conn);
        }

        // Validate phonenumber with RegEx, send back error if failed
        validate.validatePhonenumber(JSONMessage['RECEIVER_PHONE_NUMBER'])
        validate.validatePhonenumber(JSONMessage['SENDER_PHONE_NUMBER']);

        // Check if caller is calling
        if (clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] != 'calling') {
            var error = new Error('Caller is Missing Calling Status');
            error.name = 'Defined';
            throw error;
        }

        // Send message to the client with the phonenumber
        clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));

        conn.send(JSON.stringify({
            'RESPONSE': 'Call Answer Sent'
        }))

        // Set status to other clients phone number
        if (JSONMessage['RESPONSE'] == 'accept') {
            clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] = JSONMessage['SENDER_PHONE_NUMBER']
            clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] = JSONMessage['RECEIVER_PHONE_NUMBER']
        }
        if (process.env.VERBOSE == 'true') console.log("COMMON: " + JSONMessage['SENDER_PHONE_NUMBER'] + " Answered " + JSONMessage['RECEIVER_PHONE_NUMBER'] + " Call Request With: " + JSONMessage['RESPONSE']);
    } catch (err) {
        handleError(err);
    }
}

function ICECandidate(conn, JSONMessage, clients) {
    try {
        // Check if verified client exists
        if (!(clients[JSONMessage['SENDER_PHONE_NUMBER']] && clients[JSONMessage['RECEIVER_PHONE_NUMBER']])) {
            var error = new Error('Caller or Contact Is Not a Verified Active Connection');
            error.name = 'Defined';
            throw error;
        }

        if (clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] != JSONMessage['SENDER_PHONE_NUMBER'] ||
            clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] != JSONMessage['RECEIVER_PHONE_NUMBER']) {
            var error = new Error('Caller or Contact Is Not in an Active Call');
            error.name = 'Defined';
            throw error;
        }

        // Send message to the client with the phonenumber
        clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));
    } catch (err) {
        handleError(err);
    }
}

function hangUp(conn, JSONMessage, clients) {
    try {
        // Check if verified client exists
        if (!(clients[JSONMessage['SENDER_PHONE_NUMBER']] && clients[JSONMessage['RECEIVER_PHONE_NUMBER']])) {
            var error = new Error('Caller or Contact Is Not a Verified Active Connection');
            error.name = 'Defined';
            throw error;
        }

        // Validate if required fields are in the JSON
        validate.validateJSONFields(JSONMessage, ['RECEIVER_PHONE_NUMBER', 'SENDER_PHONE_NUMBER'], conn);

        // Validate phonenumber with RegEx, send back error if failed
        validate.validatePhonenumber(JSONMessage['RECEIVER_PHONE_NUMBER']);
        validate.validatePhonenumber(JSONMessage['SENDER_PHONE_NUMBER']);

        if (clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] != JSONMessage['SENDER_PHONE_NUMBER'] ||
            clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] != JSONMessage['RECEIVER_PHONE_NUMBER']) {
            var error = new Error('Caller or Contact Is Not in an Active Call');
            error.name = 'Defined';
            throw error;
        }

        // Send message to the client with the phonenumber
        clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));

        conn.send(JSON.stringify({
            'RESPONSE': 'Call Hang Up Sent'
        }))

        clients[JSONMessage['SENDER_PHONE_NUMBER']]['STATUS'] = 'free'
        clients[JSONMessage['RECEIVER_PHONE_NUMBER']]['STATUS'] = 'free'

        if (process.env.VERBOSE == 'true') {
            console.log("COMMON: " + JSONMessage['SENDER_PHONE_NUMBER'] + " Hung Up On " + JSONMessage['RECEIVER_PHONE_NUMBER']);
        }
    } catch (err) {
        handleError(err);
    }
}

function removeClient(conn, clients) {
    for (const [key, value] of Object.entries(clients)) {
        if (clients[key]['CONNECTION'] == conn) {
            if (process.env.VERBOSE == 'true') console.log("COMMON: Remove Client");

            // Set status for potantial user that has active call with user
            if (clients[clients[key]['STATUS']]) {
                clients[clients[key]['STATUS']]['STATUS'] = 'free';
            }

            delete clients[key];
        }
    }
}

module.exports.connect = connect;
module.exports.call = call;
module.exports.callResponse = callResponse;
module.exports.ICECandidate = ICECandidate;
module.exports.hangUp = hangUp;
module.exports.removeClient = removeClient;