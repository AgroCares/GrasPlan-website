require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Enbable express
const app = express();

// Enable helmet
app.use(helmet());

// Enable compression
app.use(compression());

// Enable json reading
app.use(express.json());

// Set up the cookies
app.use(cookieParser(process.env.GRAS_SESSION_SECRET));

// Set the view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Enable the routing
app.use(require('./routes/routes_pages'));
app.use(require('./routes/routes_api'));

// Enable the assets
app.use(express.static(path.join(__dirname, 'public')));

// Listen to port
const port = process.env.PORT;
app.listen(port);


// Requests not found
app.use(function(req, res) {
    res.status(404);
    res.render('pages/404', {logged_in: false});
});

console.log('Server running at PORT ' + port + ' in ' + process.env.NODE_ENV + ' mode');