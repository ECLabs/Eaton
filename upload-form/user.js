var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();


app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
	
app.use(express.static(__dirname+ '/public'));



app.listen(3000);

console.log("Running on port 3000");