const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('botkit:webserver');

module.exports = (controller) => {

    // let webserver = express();
    // webserver.use(bodyParser.json());
    // webserver.use(bodyParser.urlencoded({extended: true}));

    // // import express middlewares that are present in /components/express_middleware
    // let normalizedPath = require("path").join(__dirname, "express_middleware");

    // webserver.use(express.static('public'));

    // webserver.listen(process.env.PORT || 3000);
    controller.setupWebserver((process.env.PORT || 3000), function(err, webserver) {
      debug(`🚀 Congratulation, the web server is online!`);

      require('./incoming-webhook.js')(webserver, controller);
    });

    return controller.webserver;
}