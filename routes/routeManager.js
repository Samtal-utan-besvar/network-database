const sanitize = require('../validation/sanitize.js');
const authenticateToken = require('../jwt/jwtAuth').authenticateToken;

const get = require('./get');
const post = require('./post');
const del = require('./delete');
const put = require('./put');

// ROUTES //
function routeManager(app) {
	app.post('/create_user', sanitize, post.createUser);
	app.post('/login', sanitize, post.login);
	app.post('/add_contact', sanitize, authenticateToken, post.addContact);
	app.get('/authenticate', sanitize, authenticateToken, get.authenticate);
	app.get('/get_user', sanitize, authenticateToken, get.getUserData);
	app.get('/get_contacts', sanitize, authenticateToken, get.getContactList);
	app.delete('/delete_contact', sanitize, authenticateToken, del.deleteContact);
	app.put('/put_firstname', sanitize, authenticateToken, put.putFirstname);
	app.put('/put_lastname', sanitize, authenticateToken, put.putLastname);
	app.put('/put_phonenumber', sanitize, authenticateToken, put.putPhonenumber);
}

module.exports = routeManager;
