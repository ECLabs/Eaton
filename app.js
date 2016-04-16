var express = require('express');
var http = require('http');
var qs = require('querystring');
var datalayer = require('./datalayer');
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
 * Form submission
 */
app.post('/submit', function (req, res) {
  var body = '';
  
  req.on('data', function (data) {
  	body += data;
  });
  
  req.on('end', function(){
  	var result = qs.parse(body);
  	
  	if(result.name != undefined){
  		datalayer.addTravelRecord(result, res);
  	}else{
  		res.send("error: name is undefined");
  	}
  	
  	console.log(result);
  });
});

/*
 * History retrieval
 */
app.post('/history', function (req, res) {
  var body = '';
  
  req.on('data', function (data) {
  	body += data;
  });
  
  req.on('end', function(){
  	var result = qs.parse(body);
  	
  	if(result.name != undefined){
  		datalayer.getHistory(result.name, res);
  	}else{
  		res.send("error: name is undefined");
  	}
  	
  	console.log(result);
  });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});