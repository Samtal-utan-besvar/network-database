const fs = require('fs');
const { handleError } = require('../validation/validate');

// Using dictionary because directly using strings does not save state during loading.
var files = {};

const loadChangePasswordHtml = new Promise((resolve, reject) => {
    fs.readFile('./pages/email/html/changePassword.html', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            handleError(err);
        } else {
            resolve(data.toString());
        }
    });
});

// Load all pages into memory
const loadPages = new Promise((resolve, reject) => {
    loadChangePasswordHtml
        .then(data => {
            files["changePasswordHtml"] = data;
            resolve(); // Finished loading
        })
        .catch(err => {
            handleError(err);
        })
});

module.exports.loadPages = loadPages;
module.exports.files = files;