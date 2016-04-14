var express = require('express');
var AWS = require('aws-sdk'); 
var http = require('http');
var qs = require('querystring');

AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB();

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.static('app'));

/*
 * Add /heatbeat to base url to see if application is running
 */
app.get('/heartbeat', function (req, res) {
  //TODO add database queries and anything else to exercise all third party communications to provide a better check
  res.send('I\'m alive!');
});

/*
 * Add /heatbeat to base url to see if application is running
 */
app.post('/submit', function (req, res) {
  //TODO add database queries and anything else to exercise all third party communications to provide a better check
  
  var body = '';
  
  req.on('data', function (data) {
  	body += data;
  });
  
  req.on('end', function(){
  	var result = qs.parse(body);
  	console.log(result)
  });
  res.send('WOrked');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});