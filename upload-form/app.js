var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var AWS = require('aws-sdk');
var s3BrowserUpload = require('s3-browser-direct-upload');
var done = false;
var busboy = require('connect-busboy');

var s3 = new AWS.S3();

var bucketName = 'eaton-resume-bucket';


app.use(express.static(path.join(__dirname, 'html')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use(busboy());

app.post('/fileupload', function(req, res){
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('thumbnail', function(fieldname, file, filename){
		console.log('Uploading: ' + filename);
		fstream = fs.createWriteStream(__dirname + '/uploads/', + filename);
		file.pipe(fstream);
		fstream.on('close', function (){
			res.redirect('back');
		});
	});
});
	
app.listen(3000);

console.log("Running on port 3000");