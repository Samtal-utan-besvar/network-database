const express = require('express');
const app = express();

// Load the routes
const getRoutes = require('./routes/get')(app);
const postRoutes = require('./routes/post')(app);
const deleteRoutes = require('./routes/delete')(app);

const port = 8080;

app.use(express.json());

app.listen(port, () => {
    console.log("Server running on port: " + port);
});
