var express = require('express');
var http = require('http');
var qs = require('querystring');
var cors = require('cors');

/* App files */ 
var controller = require('./controller');

var app = express();

app.set('port', process.env.PORT || 8081);
app.use(express.static('personal-travel-reporting-web-app'));
app.use(cors());

/* Url Mapping is inside the controller*/
controller.main(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});