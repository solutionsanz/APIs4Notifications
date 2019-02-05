// Define app configuration in a single location, but pull in values from
// system environment variables (so we don't check them in to source control!)
module.exports = {
    // Twilio Account SID - found on your dashboard
    accountSid: process.env.TWILIO_ACCOUNT_SID,

    // Twilio Auth Token - found on your dashboard
    authToken: process.env.TWILIO_AUTH_TOKEN,

    // A Twilio number that you have purchased through the twilio.com web
    // interface or API
    twilioNumber: process.env.TWILIO_NUMBER,

    // A Local Twilio number that you have verified through the twilio.com web
    // interface or API
    localTwilioNumber: process.env.LOCAL_TWILIO_NUMBER,

    // ICS Details:
    ICS_SERVER: process.env.ICS_SERVER,
    ICS_USERNAME: process.env.ICS_USERNAME,
    ICS_PASSWORD: process.env.ICS_PASSWORD,

    
    MONGODB_SERVER: process.env.MONGODB_SERVER || "localhost",    
    MONGODB_PORT: process.env.MONGODB_PORT || "27017",
    MONGODB_USERNAME: process.env.MONGODB_USERNAME || "NA",
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD || "NA",

    // Custom:
    PROTOCOL: process.env.PROTOCOL || "http",

    // The port your web application will run on
    port: process.env.PORT || process.env.PORT

};