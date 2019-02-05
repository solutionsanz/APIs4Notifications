var http = require('http');
var express = require('express');
var config = require("./config");

// Create an Express web app
var app = express();


// New Code
var mongo = require('mongodb');
var monk = require('monk');
var MONGODB_CREDENTIALS = "";

if ((config.MONGODB_USERNAME != null && config.MONGODB_PASSWORD != null &&
    config.MONGODB_USERNAME != undefined && config.MONGODB_PASSWORD != undefined) &&
    config.MONGODB_USERNAME != "NA" && config.MONGODB_PASSWORD != "NA") {

    MONGODB_CREDENTIALS = config.MONGODB_USERNAME + ":" + config.MONGODB_PASSWORD + "@";
    console.log("Connecting to MongoDB with username [" + config.MONGODB_USERNAME + "]");
}

var mongoConfig = MONGODB_CREDENTIALS + config.MONGODB_SERVER + ':' + config.MONGODB_PORT + '/s2viia_contacts';

var db = monk(mongoConfig);


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Configure routes and middleware for the application
require('./routes')(app);

// Create an HTTP server to run our application
var server = http.createServer(app);

// export the HTTP server as the public module interface
module.exports = server;