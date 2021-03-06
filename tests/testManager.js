const main = require('../setup/main');
const { handleError } = require('../validation/validate');

function runTests() {
    describe("Test Manager", function () {
        importTest('Websocket Test - Full Clean', './ws/cleanFull');
        importTest('Database Test - Full Clean', './db/cleanFull');
        importTest('Database Test - Fail Create User', './db/failCreateUser');
        importTest('Database Test - Fail Authenticate User', './db/failAuthenticate');
        importTest('Database Test - Fail Login User', './db/failLoginUser');
        importTest('Database Test - Fail Add Contact', './db/failAddContact');
        importTest('Database Test - Fail Get User Data', './db/failGetUserData');
        importTest('Database Test - Fail Get Contacts', './db/failGetContacts');
        importTest('Database Test - Fail Get Password Reset Code', './db/failGetResetPasswordCode');
        importTest('Database Test - Fail Verify Password Reset Code', './db/failVerifyResetPasswordCode');
        importTest('Database Test - Fail Delete Contact', './db/failDeleteContact');
        importTest('Database Test - Fail Put Firstname', './db/failPutFirstname');
        importTest('Database Test - Fail Put Lastname', './db/failPutLastname');
        importTest('Database Test - Fail Put Phone Number', './db/failPutPhoneNumber');
        importTest('Database Test - Fail Put Password', './db/failPutPassword');
    });
}

function importTest(name, path) {
    describe(name, function () {
        // Set a custom timeout message
        let timeout;
        this.timeout(0);

        beforeEach(() => {
            timeout = setTimeout(() => {
                throw new Error('Connection response timed out, did the WS connection validation fail?');
            }, 2000);
        });

        afterEach(() => clearTimeout(timeout));

        // Load tests
        require(path);
    });
}

// Run tests once setup
main.subscribeIsSetup(run);

// Setup services
process.nextTick(function () {
    main.setupMain
})
runTests();
