const authenticateToken = require('./jwt/jwtAuth').authenticateToken;

const get = require('./routes/get');
const post = require('./routes/post');
const del = require('./routes/delete');

// ROUTES //
function routeManager(app) {
	app.post('/create_user', post.createUser);
	app.post('/login', post.login);
	app.post('/add_contact', authenticateToken, post.addContact);
	app.get('/authenticate', get.authenticate);
	app.get('/get_contacts', authenticateToken, get.getContactList);
	app.get('/get_users', get.getUsers);
	app.delete('/delete_contact', authenticateToken, del.deleteContact);
}

module.exports = routeManager;
