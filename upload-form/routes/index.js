var express = require('express');
var router = express.Router();
var multer = require('multer');
var done = false;
var AWS = require('aws-sdk');

var s3 = new AWS.S3();

var bucketName = 'eaton-resume-bucket';

router.use(multer({ 
	dest: './uploads/',
	onFileUploadStart: function (file, data, req, res) {
		console.log(file.originalname + ' is starting ...')
		var params = {
			Bucket: bucketName,
			Key: file.name,
			Body: data
		};
		s3.putObject(params, function(perr, pres){
			if (perr){
				console.log("Error uploading data: ", perr);
			} else {
				console.log("Successfully uploaded data to Eaton Resume Bucket");
			}
		});
	},
	onFileUploadComplete: function(file) {
		console.log(file.fieldname + ' uploaded to ' + file.path)
		done = true;
	}
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload Form' });
});

router.post('/', function(req, res){
	if(done == true){
		console.log(req.files);
		res.end("File uploaded.");
	}
});

module.exports = router;


