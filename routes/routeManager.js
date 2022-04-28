const authenticateToken = require('../jwt/jwtAuth').authenticateToken;

const get = require('./get');
const post = require('./post');
const del = require('./delete');
const put = require('./put');

// ROUTES //
function routeManager(app) {
	app.post('/create_user', post.createUser);
	app.post('/login', post.login);
	app.post('/add_contact', authenticateToken, post.addContact);
	app.get('/authenticate', authenticateToken, get.authenticate);
	app.get('/get_user', authenticateToken, get.getUserData);
	app.get('/get_contacts', authenticateToken, get.getContactList);
	app.delete('/delete_contact', authenticateToken, del.deleteContact);
	app.put('/put_firstname', authenticateToken, put.putFirstname);
	app.put('/put_lastname', authenticateToken, put.putLastname);
	app.put('/put_phonenumber', authenticateToken, put.putPhonenumber);
}

module.exports = routeManager;
