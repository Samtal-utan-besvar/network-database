﻿const jwtAuth = require('../jwt/jwtAuth');
const validateJSONFields = require('./wsHelpers').validateJSONFields;
const validateEmail = require('./wsHelpers').validateEmail;
const validatePhonenumber = require('./wsHelpers').validatePhonenumber;
const validateName = require('./wsHelpers').validateName;
const pool = require('../db');

// Asynchronous connect function
function connect(conn, JSONMessage, clients) {
    jwtAuth.authenticateWsToken(JSONMessage['TOKEN'], function (email) {

        // Add client and send response if valid request
        if (validateEmail(email, conn)) {
            try {
                pool.query(
                    `SELECT phone_number FROM USERS WHERE email = $1`,
                    [email], (err, result) => {
                        if (err) {
                            conn.send(JSON.stringify({
                                'RESPONSE': 'Invalid User'
                            }));
                        } else {
                            if (!result.rows[0]) {
                                conn.send(JSON.stringify({
                                    'RESPONSE': 'User Does Not Exist'
                                }))

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

                            if (process.env.ENV_VERBOSE == true) console.log("COMMON: User With Phone Number " + result.rows[0]['phone_number'] + " Has Connected.");
                        }
                    }
                );
            } catch (err) {
                console.log(err.message);
                conn.send(JSON.stringify({
                    'RESPONSE': 'Error'
                }));
            }
        }
    });
}

function call(conn, JSONMessage, clients) {
    var validRequest = true

    // Check if verified client exists
    if (!(clients[JSONMessage['CALLER_PHONE_NUMBER']] && clients[JSONMessage['TARGET_PHONE_NUMBER']])) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not a Verified Active Connection'
        }))

        return; // End request
    }

    // Check if users are already in a call
    if (clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] != 'free' || clients[JSONMessage['TARGET_PHONE_NUMBER']]['STATUS'] != 'free' ) {
        conn.send(JSON.stringify({
            'RESPONSE': 'User Not Free'
        }))

        validRequest = false;
    }

    // Validate if required fields are in the JSON
    if (validRequest) {
        validRequest = validateJSONFields(JSONMessage, ['CALLER_PHONE_NUMBER', 'TARGET_PHONE_NUMBER', 'SDP'], conn);
    }

    // Validate phonenumber with RegEx, send back error if failed
    if (validRequest) {
        validRequest = validatePhonenumber(JSONMessage['CALLER_PHONE_NUMBER', 'TARGET_PHONE_NUMBER'], conn);
    }

    // Send message to the client with the phonenumber
    if (validRequest) {
        clients[JSONMessage['TARGET_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));
        clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] = 'calling'

        conn.send(JSON.stringify({
            'RESPONSE': 'Call Placed'
        }))

        if (process.env.ENV_VERBOSE == true) console.log("COMMON: " + JSONMessage['CALLER_PHONE_NUMBER'] + " Is Calling " + JSONMessage['TARGET_PHONE_NUMBER'] + ".");
    }
}

function callResponse(conn, JSONMessage, clients) {
    // Check if verified client exists
    if (!(clients[JSONMessage['CALLER_PHONE_NUMBER']] && clients[JSONMessage['TARGET_PHONE_NUMBER']])) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not a Verified Active Connection'
        }))

        return; // End request
    }

    // Validate if required fields are in the JSON
    var validRequest = validateJSONFields(JSONMessage, ['RESPONSE', 'TARGET_PHONE_NUMBER', 'CALLER_PHONE_NUMBER'], conn);

    if (validRequest && JSONMessage['RESPONSE'] == 'accept') {
        validRequest = validateJSONFields(JSONMessage, ['SDP'], conn);
    }

    // Validate phonenumber with RegEx, send back error if failed
    if (validRequest) {
        validRequest = validatePhonenumber(JSONMessage['TARGET_PHONE_NUMBER'], conn) &&
            validatePhonenumber(JSONMessage['CALLER_PHONE_NUMBER'], conn);
    }

    // Check if caller is calling
    if (clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] != 'calling') {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller is Missing Calling Status'
        }))

        return; // End request
    }

    // Send message to the client with the phonenumber
    if (validRequest) {
        clients[JSONMessage['CALLER_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));

        conn.send(JSON.stringify({
            'RESPONSE': 'Call Answer Sent'
        }))

        // Set status to other clients phone number
        if (JSONMessage['RESPONSE'] == 'accept') {
            clients[JSONMessage['TARGET_PHONE_NUMBER']]['STATUS'] = JSONMessage['CALLER_PHONE_NUMBER']
            clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] = JSONMessage['TARGET_PHONE_NUMBER']
        }
        if (process.env.ENV_VERBOSE == true) console.log("COMMON: " + JSONMessage['TARGET_PHONE_NUMBER'] + " Answered " + JSONMessage['CALLER_PHONE_NUMBER'] + " Call Request With: " + JSONMessage['RESPONSE']);
    }
}

function ICECandidate(conn, JSONMessage, clients) {
    // Check if verified client exists
    if (!(clients[JSONMessage['ORIGIN_PHONE_NUMBER']] && clients[JSONMessage['TARGET_PHONE_NUMBER']])) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not a Verified Active Connection'
        }))

        return; // End request
    }

    if (clients[JSONMessage['TARGET_PHONE_NUMBER']]['STATUS'] != JSONMessage['ORIGIN_PHONE_NUMBER'] ||
        clients[JSONMessage['ORIGIN_PHONE_NUMBER']]['STATUS'] != JSONMessage['TARGET_PHONE_NUMBER']) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not in an Active Call'
        }))

        return; // End request
    }

    // Send message to the client with the phonenumber
    clients[JSONMessage['TARGET_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));
}

function hangUp(conn, JSONMessage, clients) {
    // Check if verified client exists
    if (!(clients[JSONMessage['CALLER_PHONE_NUMBER']] && clients[JSONMessage['TARGET_PHONE_NUMBER']])) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not a Verified Active Connection'
        }))

        return; // End request
    }

    // Validate if required fields are in the JSON
    var validRequest = validateJSONFields(JSONMessage, ['TARGET_PHONE_NUMBER', 'CALLER_PHONE_NUMBER'], conn);

    // Validate phonenumber with RegEx, send back error if failed
    if (validRequest) {
        validRequest = validatePhonenumber(JSONMessage['TARGET_PHONE_NUMBER'], conn) &&
            validatePhonenumber(JSONMessage['CALLER_PHONE_NUMBER'], conn);
    }

    if (clients[JSONMessage['TARGET_PHONE_NUMBER']]['STATUS'] != JSONMessage['CALLER_PHONE_NUMBER']||
        clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] != JSONMessage['TARGET_PHONE_NUMBER']) {
        conn.send(JSON.stringify({
            'RESPONSE': 'Caller or Contact Is Not in an Active Call'
        }))

        return; // End request
    }

    // Send message to the client with the phonenumber
    if (validRequest) {
        clients[JSONMessage['TARGET_PHONE_NUMBER']]['CONNECTION'].send(JSON.stringify(JSONMessage));
        
        conn.send(JSON.stringify({
            'RESPONSE': 'Call Hang Up Sent'
        }))

        clients[JSONMessage['CALLER_PHONE_NUMBER']]['STATUS'] = 'free'
        clients[JSONMessage['TARGET_PHONE_NUMBER']]['STATUS'] = 'free'

        if (process.env.ENV_VERBOSE == true) {
            console.log("COMMON: " + JSONMessage['CALLER_PHONE_NUMBER'] + " Hung Up On " + JSONMessage['TARGET_PHONE_NUMBER']);
        }
    }
}

function removeClient(conn, clients) {
    for (const [key, value] of Object.entries(clients)) {
        if (clients[key]['CONNECTION'] == conn) {
            if (process.env.ENV_VERBOSE == true) console.log("COMMON: Remove Client");

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