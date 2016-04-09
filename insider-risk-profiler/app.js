var express = require('express');
var AWS = require('aws-sdk'); 

var app = express();
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB();

app.use(express.static('app'));

/*
 * Add /heatbeat to base url to see if application is running
 */
app.get('/heartbeat', function (req, res) {
  //TODO add database queries and anything else to exercise all third party communications to provide a better check
  res.send('I\'m alive!');
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server started at http://%s:%s', host, port);
});