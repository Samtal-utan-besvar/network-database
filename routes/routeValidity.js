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

module.exports.verifyNoneEmpty = verifyNoneEmpty;
module.exports.sanitize = sanitize;