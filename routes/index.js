var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var twilio = require('twilio');
var config = require("../config");
var http = require('http');
var https = require('https');

//CRI change:
var bodyParser = require('body-parser');

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(config.accountSid, config.authToken);

// Configure application routes
module.exports = function (app) {
    // Set Jade as the default template engine
    app.set('view engine', 'jade');

    // Express static file middleware - serves up JS, CSS, and images from the
    // "public" directory where we started our webapp process
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Parse incoming request bodies as form-encoded
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Use morgan for HTTP request logging
    app.use(morgan('combined'));

    // CRI change:    
    app.use(bodyParser.json()); // Support for json encoded bodies 
    app.use(bodyParser.urlencoded({
        extended: true
    })); // Support for encoded bodies

    // Home Page with Click to Call 
    app.get('/', function (request, response) {
        response.render('index');
    });

    // Handle an AJAX POST request to place an outbound call
    app.post('/call', function (request, response) {
        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        var url = 'http://' + request.headers.host + '/outbound';
        console.log("URL is [" + url + "]");

        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: request.body.phoneNumber,
            from: config.twilioNumber,
            url: url
        }, function (err, message) {
            console.log(err);
            if (err) {
                //response.status(500).send(err);
            } else {
                response.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    });

    // Return TwiML instuctions for the outbound call
    app.post('/outbound', function (request, response) {
        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade
        response.type('text/xml');
        response.render('outbound', {
            msg: 'Hello, Callan. I am calling you from the Oracle Cloud. I know everything about you. I can see everything...I am watching you.'
        });
    });


    // Handle an AJAX POST request to place an outbound call
    app.get('/getcall', function (request, response) {

        // "to" and "msg" are NOT set via query or parameters anymore. Only via a POST body is allowed here.
        var to = request.query.to;
        to = to.indexOf("+") != -1 ? to : "+" + to;
        var msg = request.query.msg;

        if (msg == null || msg == undefined || to == null || to == undefined) {
            console.log("Message or To number were not defined. Bad request found, thus nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }


        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        var url = 'http://' + request.headers.host + '/voiceoutbound' + '?msg=' + encodeURI(msg);
        console.log("URL is [" + url + "], to is [" + to + "], msg is [" + msg + "]");

        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: to,
            from: config.twilioNumber,
            url: url
        }, function (err, message) {
            console.log(err);
            if (err) {
                //response.sendStatus(500).send(err);
            } else {
                response.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    });



    /** Extend origonal code to allow generic texts and APIs.  */

    // Handle an AJAX POST request to place an outbound call
    app.post('/voicecall', function (request, response) {

        // "to" and "msg" are NOT set via query or parameters anymore. Only via a POST body is allowed here.
        var to = "" + request.body.to;
        var msg = "" + request.body.msg;

        console.log("Received [to] parameter is [" + to + "], [msg] is [" + msg + "]");

        to = to.indexOf("+") != -1 ? to : "+" + to;

        if (msg == null || msg == undefined || to == null || to == undefined) {
            console.log("Message or To number were not defined. Bad request found, thus nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }


        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        console.log("Using protocol [" + config.PROTOCOL + "]");
        var url = config.PROTOCOL + '://' + request.headers.host + '/voiceoutbound' + '?msg=' + encodeURI(msg);
        console.log("URL is [" + url + "], to is [" + to + "], msg is [" + msg + "]");

        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: to,
            from: config.localTwilioNumber,
            url: url
        }, function (err, message) {
            console.log(err);
            if (err) {
                //response.sendStatus(500).send(err);
            } else {
                response.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    });


    // Handle an AJAX POST request to place an outbound call with Gathering (menu) capabilities
    app.post('/voicemenu', function (request, response) {

        // "to" and "name" are NOT set via query or parameters anymore. Only via a POST body is allowed here.
        var to = request.body.to;
        to = to.indexOf("+") != -1 ? to : "+" + to;
        var name = request.body.name;

        if (name == null || name == undefined || to == null || to == undefined) {
            console.log("Name or To number were not defined. Bad request found, thus nothing to do...");
            // if (response != null && response != undefined) {
            //     response.sendStatus(400);//Bad request...
            // }
            return;
        }


        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        var url = 'http://' + request.headers.host + '/voicemenuoutbound' + '?name=' + encodeURI(name);
        console.log("URL is [" + url + "], to is [" + to + "], name is [" + name + "]");

        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: to,
            from: config.localTwilioNumber,
            url: url
        }, function (err, message) {
            console.log(err);
            if (err) {
                // if (response != null && response != undefined) {
                //     response.sendStatus(500).send(err);
                // }
            } else {
                response.send({
                    message: 'Thank you! We will be calling your number shortly using a menu of options.'
                });
            }
        });
    });

    // Return TwiML instuctions for the outbound call
    app.post('/voiceoutbound', function (request, response) {

        var msgTTS = request.query.msg;
        console.log("Message in /voiceoutbound call is [" + msgTTS + "]");

        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade
        response.type('text/xml');
        response.render('outbound', {
            msg: msgTTS
        });
    });


    // Return TwiML Gathering (menu) instuctions for the outbound call coming from Twilio
    app.post('/voicemenuoutbound', function (request, response) {

        var name = request.query.name;
        console.log("Name in /voicemenuoutbound call is [" + name + "]");

        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade
        response.type('text/xml');
        response.render('outboundGather', {
            name: name
        });
    });


    // Process TwiML Gather Action:
    app.get('/processmenu', function (request, response) {

        var option = request.query.Digits;
        console.log("User entered option [" + option + "]");

        //If 1: Send a message to Salesforce
        //If 2: Send a message to Facebook  
        //If 3: Send a message to LinkedIn
        //If 4: Call Franco and ask him what to do...
        var currentdate = new Date();
        var datetime = "Message sent at: " + currentdate.getDate() + "/" +
            (currentdate.getMonth() + 1) + "/" +
            currentdate.getFullYear() + " @ " +
            currentdate.getHours() + ":" +
            currentdate.getMinutes() + ":" +
            currentdate.getSeconds();
        var msgToBeSent = "Hello, this message was produced using Twilio APIs in Oracle ";
        msgToBeSent += "Application Container Cloud Service and subsequently integrated ";
        msgToBeSent += "via Oracle Integration Cloud Service. ";
        msgToBeSent += datetime + ". We wish you happy APIs...";

        if (option != null && option != undefined) {

            switch (option) {

                case "1":
                    var voiceMsg = "Thank you we are going to send a message to Salesforce. Good bye";

                    // Call the API
                    callAPI("Salesforce", msgToBeSent);

                    //Callback to Twilio with a voice response.
                    response.type('text/xml');
                    response.render('outbound', {
                        msg: voiceMsg
                    });

                    break;

                case "2":
                    var voiceMsg = "Thank you we are going to send a message to Facebook. Good bye";

                    // Call the API
                    callAPI("Facebook", msgToBeSent);

                    //Callback to Twilio with a voice response.
                    response.type('text/xml');
                    response.render('outbound', {
                        msg: voiceMsg
                    });

                    break;

                case "3":
                    var voiceMsg = "Thank you we are going to send a message to LinkedIn. Good bye"

                    // Call the API
                    callAPI("LinkedIn", msgToBeSent);

                    //Callback to Twilio with a voice response.
                    response.type('text/xml');
                    response.render('outbound', {
                        msg: voiceMsg
                    });

                    break;

                case "4":
                    var mobile = "+61414567657"; //Franco's mobile'
                    var name = "Franco";
                    response.type('text/xml');
                    response.render('callSomeone', {
                        name: name,
                        mobile: mobile
                    });
                    break;

                default:
                    console.log("Unknown option!!! Nothing to do...");
                    //Hanging up current call
                    response.type('text/xml');
                    response.render('hangup');

            }
        }


    });


    // Handle an AJAX POST request to place an outbound call
    app.post('/sms', function (request, response) {

        // "to" and "msg" are NOT set via query or parameters anymore. Only via a POST body is allowed here.
        var to = "" + request.body.to;
        var msg = "" + request.body.msg;

        console.log("Received [to] parameter is [" + to + "], [msg] is [" + msg + "]");

        to = to.indexOf("+") != -1 ? to : "+" + to;


        if (msg == null || msg == undefined || to == null || to == undefined) {
            console.log("Message or To number were not defined. Bad request found, thus nothing to do...");
            // if (response != null && response != undefined) {
            //     response.sendStatus(400);//Bad request...
            // }
            return;
        }


        // Create options to send the message
        var options = {
            to: to,
            from: config.twilioNumber,
            body: msg
        };

        // Send the message!
        client.sendMessage(options, function (err, response) {
            if (err) {
                // Just log it for now
                console.error(err);
                // if (response != null && response != undefined) {
                //     response.sendStatus(500);//Internal Server error...
                // }
                return;
            } else {
                console.log('Message [' + msg + '] sent to [' + to + ']');
            }
        });

        // Return successfully Accepted call.
        //response.sendStatus(202).end();

        response.send({
            message: 'Thank you! We will send the SMS shortly.'
        });

    });


    /**
     * smsplus is used to bridge from Alexa to NodeJS via an HA bridge.
     * Since we need a GET API, we are creating this API that simplu routes into 
     * the proper /notifications/bulk/:type API.
     * 
     */
    app.get('/notification/bulk/smsplus', function (request, response) {

        // Call the voicecall API:        
        var host = request.headers.host;
        host = host.indexOf(":") != -1 ? host.substring(0, host.indexOf(":")) : host;
        var port = config.port;
        var path = "/notification/bulk/smsplus";
        var method = "POST";
        var body = "";

        // Call API:
        sendRequest(host, port, path, method, body, false);

        // Return successfully Accepted call.
        response.sendStatus(202).end();
    });

    // Processing bulk voice calls
    app.post('/notification/bulk/:type', function (request, response) {

        console.log("Processing a bulk Notifications...");

        var type = request.params.type;

        console.log("Invoking Type [" + type + "]");

        if (type == null || type == undefined || (type != "sms" && type != "smsplus" && type != "voicecall")) {
            console.log("Bulk type incorrect or not present... Nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }

        /*
                //***********************
                //**************
                // Deprecating receiving the values via the request. Substituting via a MongoDB interrogation:
                //**************
                //***********************
                // Previously sending:
                        {"values":[
                            {"to":"+61449588440", "msg":"Hello world 1"}, 
                            {"to":"+61451461367", "msg":"Hello world 2"}
                        ]}        
                ////////////////////////////
        
        
                // Point to array of values...
                var values = request.body.values;
        
                if (values == null || values == undefined) {
                    console.log("Bulk payload detected but no values on it... Nothing to do...");
                    //response.sendStatus(400);//Bad request...
                    return;
                }
        */

        // Retrieving List from MongoDB:
        console.log("Request db");
        var db = request.db;


        console.log("Req collection");
        var collection = db.get('usercollection');

        console.log("Collection find");
        collection.find({}, {}, function (e, docs) {

            if (docs == null || docs == undefined) {
                return;
            }

            console.log("List of contacts found [" + JSON.stringify(docs) + "]");

            // Iterating through DOC JSON array:
            users = {
                "contacts": docs
            };

            console.log("Iterating through contacts JSON array [" + JSON.stringify(users.contacts) + "]");
            var i = 0;

            for (; i < users.contacts.length; ++i) {

                // Get current key:
                currentValue = users.contacts[i];

                if (currentValue != null) {

                    console.log("New array element found [" + JSON.stringify(currentValue) + "]");

                    // Do something here with the value...
                    console.log("Retrieving mobile from MongoDB");
                    to = currentValue.mobile;
                    to = to.indexOf("+") != -1 ? to : "+" + to;
                    switch (type.toLowerCase()) {

                        case "smsplus":

                            console.log("*** Overriding MongoDB message by a custom one...");
                            msg = "Thank you for attending the Oracle Integration in Action workshop. We hope you found it useful...";

                            break;

                        default:
                            console.log("Retrieving message from MongoDB");
                            msg = currentValue.msg;
                    }

                    name = currentValue.name;

                    reqBody = '{"to":"' + to + '","msg":"' + name + ', ' + msg + '"}';

                    console.log("Displaying current value: to is [" + to + "], msg is [" + msg + "], name is [" + name + "]");
                    console.log("Request Body to send for processing is: [" + reqBody + "]");


                    if (msg == null || msg == undefined || to == null || to == undefined || name == null || name == undefined) {
                        console.log("NAME, Message or To number were not defined. Bad request found, thus nothing to do...");
                        //response.sendStatus(400);//Bad request...
                        return;
                    }


                    // Call the voicecall API:        
                    var host = request.headers.host;
                    host = host.indexOf(":") != -1 ? host.substring(0, host.indexOf(":")) : host;
                    var port = config.port;
                    var path = type == "smsplus" ? "/sms" : "/" + type;
                    var method = "POST";
                    //var body = JSON.stringify(currentValue);
                    var body = reqBody;

                    // Call API:
                    sendRequest(host, port, path, method, body, false);

                    // Waiting 0.5 secs to iterate
                    setTimeout(function () {
                        console.log("Ready to iterate again!!!");
                    }, 500); //0.5 seconds delayed between API calls.

                } else {
                    db.close();
                }
            };

            console.log("It is done iterating... Finished processing [" + i + "] number of bulk values. Good bye!");
        });

        // Return successfully Accepted call.
        response.sendStatus(202).end();

    });


    // Handle an AJAX POST request to place an outbound call
    app.post('/confcall/:first/:second/:name', function (request, response) {

        // "to" and "msg" are NOT set via query or parameters anymore. Only via a POST body is allowed here.
        var firstNumber = "" + request.params.first;
        var secondNumber = "" + request.params.second;
        var name = "" + request.params.name;


        if (firstNumber == null || firstNumber == undefined) {
            console.log("firstNumber or name not defined. Bad request found, thus nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }

        console.log("Received [firstNumber] is [" + firstNumber + "], [secondNumber] is [" + secondNumber + "], [name] is [" + name + "]");

        firstNumber = firstNumber.indexOf("+") != -1 ? firstNumber : "+" + firstNumber;


        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        var url = 'http://' + request.headers.host + '/confcalloutbound' + '?name=' + encodeURI(name) + "&secondNumber=" + encodeURI(secondNumber);
        console.log("URL is [" + url + "]");

        // Place an outbound call firstNumber the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: firstNumber,
            from: config.localTwilioNumber,
            url: url
        }, function (err, message) {
            console.log(err);
            if (err) {
                //response.sendStatus(500).send(err);
            } else {
                response.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    });



    // Return TwiML instuctions for the outbound call
    app.post('/confcalloutbound', function (request, response) {

        var secondNumber = request.query.secondNumber;
        var name = request.query.name;

        console.log("Message in /confcalloutbound call is secondNumber is [" + secondNumber + "], name is [" + name + "]");

        if (secondNumber == null || secondNumber == undefined || name == null || name == undefined) {
            console.log("secondNumber or name not defined. Bad request found, nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }

        secondNumber = secondNumber.indexOf("+") != -1 ? secondNumber : "+" + secondNumber;

        var msg = "Hello, please stay on the line while Oracle Cloud connects you to " + name;

        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade

        response.type('text/xml');
        response.render('setConferenceCall', {
            msg: msg,
            toNumber: secondNumber
        });
        //response.render('outbound', { msg: name });
    });

    function callAPI(target, msg) {

        // Command the AR Drone 2 to take off, stay and land!
        var host = config.ICS_SERVER;
        var port = 443;
        var path = "/integration/flowapi/rest";
        var method = "POST";
        var body = null;

        // Assessing the target:
        switch (target) {

            case "Salesforce":
                path += "/S2VSALESFORCETORESTINTEGRATION/v01/salesforce/campaign";
                body = '{"Id":"70190000000Xf4w", "Description":"' + msg + '"}';
                break;

            case "Facebook":
                path += "/S2VFACEBOOKINTEGRATION/v01/social/facebook/message";
                body = '{"message":"' + msg + '"}';
                break;

            case "LinkedIn":
                path += "/S2VLINKEDININTEGRATION/v01/social/linkedin/message";
                body = '{"message":"' + msg + '"}';
                break;

            default:
                console.log("Unknown target!!! Nothing to do...");
                return;
        }

        // Send action to take off AR Drone 2.0
        sendRequest(host, port, path, method, body, true);
    }

    function sendRequest(host, port, path, method, post_data, secured) {

        var post_req = null;
        var username = config.ICS_USERNAME;
        var passw = config.ICS_PASSWORD;


        var options = {
            host: host,
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Content-Length': post_data.length,
                'Authorization': 'Basic ' + new Buffer(username + ':' + passw).toString('base64')
            }
        };

        if (secured) {

            post_req = https.request(options, function (res) {

                console.log("Sending [" + host + ":" + port + path + "] under method [" + method + "]");
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('Response: ', chunk);
                });
            });

        } else {

            post_req = http.request(options, function (res) {

                console.log("Sending [" + host + ":" + port + path + "] under method [" + method + "]");
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('Response: ', chunk);
                });
            });

        }


        post_req.on('error', function (e) {
            console.log('There was a problem with request: ' + e.message);
        });

        post_req.write(post_data);
        post_req.end();

    }


    /**
     * Adding MongoDB Admin API Tasks:
     * 
     */

    /* GET myTestDB page. */
    app.get('/contacts', function (req, res) {


        console.log("Req db");
        var db = req.db;

        console.log("Req collection");
        var collection = db.get('usercollection');

        console.log("Collection find");
        collection.find({}, {}, function (e, docs) {

            res.send({
                "contacts": docs
            });

        });
    });

    /* POST Add multiple Contacts */
    app.post('/contacts', function (req, res) {

        // Set our internal DB variable
        var db = req.db;
        var contacts = req.body.contacts;

        if (contacts == null || contacts == undefined) {
            console.log("contacts payload detected but no contacts on it... Nothing to do...");
            //response.sendStatus(400);//Bad request...
            return;
        }

        console.log("Array of contacts to be inserted is [" + JSON.stringify(contacts) + "]");

        // Set collection
        var collection = db.get('usercollection');

        // Insert row to MongoDB
        collection.insert(contacts, function (err, doc) {
            if (err) {
                res.send("Oops, something wrong just happened.");
            } else {
                // Return succes answer
                res.send({
                    message: 'Records were added successfully...'
                });
            }
        });
    });

    /* POST to Add User */
    app.post('/contact', function (req, res) {

        // Set our internal DB variable
        var db = req.db;

        // Get post values. These rely on the "name" attributes		
        var name = req.body.name;
        var mobile = req.body.mobile;
        var msg = req.body.msg;

        console.log("Contact to be inserted is Name [" + name + "], Mobile [" + mobile + "], msg [" + msg + "]");

        if (name == null || name == undefined || mobile == null || mobile == undefined || msg == null || msg == undefined) {
            console.log("Name, To or Message were not defined. Bad request found, thus nothing to do...");
            response.sendStatus(400); //Bad request...
        }


        // Set collection
        var collection = db.get('usercollection');

        // Insert row to MongoDB
        collection.insert({
            "name": name,
            "mobile": mobile,
            "msg": msg
        }, function (err, doc) {
            if (err) {
                res.send("Oops, something wrong just happened.");
            } else {
                // Return succes answer
                res.send({
                    message: 'Record was added successfully...'
                });
            }
        });
    });

    app.delete('/contacts', function (req, res) {


        console.log("Req db");
        var db = req.db;

        console.log("Req collection");
        var collection = db.get('usercollection');

        console.log("Collection find");

        //Remove all documents:
        collection.remove();

        // Return succes answer
        res.send({
            message: 'Records were  deleted successfully...'
        });
    });

};