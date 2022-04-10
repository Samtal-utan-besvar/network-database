require('dotenv').config({ path: './config.env' });

describe("Test Manager", function () {
    importTest('Websocket Test', './ws/wsTest');
    importTest('Database Test', './db/databaseTest');
});

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