var express = require('express');
var AWS = require('aws-sdk'); 

var app = express();
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB();

app.use(express.static('app'));

// respond with "Hello World!" on the homepage
app.get('/heartbeat', function (req, res) {
  console.log(req.query.val);
  res.send('I\'m alive!');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server started at http://%s:%s', host, port);
});