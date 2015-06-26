var express = require('express');
var router = express.Router();
var multer = require('multer');
var done = false;
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dd = new AWS.DynamoDB();
var s3 = new AWS.S3();
var bucketName = 'eaton-resume-bucket';


router.use(multer({ 
	dest: './uploads/',
	rename: function(fieldname, filename){
		return filename;
	},
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
	onFileUploadComplete: function(file, req, res) {
		console.log(file.fieldname + ' uploaded to ' + file.path)
		done = true;
		var today = new Date();
		console
		putItem("test@email.com", "6/5/2015", "Recruiter", "101");
	}
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload Form' });
});

/* GET testing dynamodb upload. */
router.get('/dynamodb-put', function(req, res, next) {
	console.log("entering function");
  	putItem("newtest@email.com", "6/5/2015", "Recruiter", "101");
  	console.log("Successfully Uploaded");
  	res.send("Success");
});

router.post('/', function(req, res){
	if(done == true){
		console.log(req.files);
		res.end("File uploaded.");
	}
});

module.exports = router;


var tableName = 'eaton-user-db';
  putItem = function(userEmail, dateCreated, userRole, userID) {
     var item = {
        'userEMail': { 'S': userEmail },
        'userID' : {'S': userID},
        'dateCreated' : { 'S': dateCreated },
      	'userRole' : { 'S': userRole },
      	'helloWorld' : { 'S': '123'},
     	'userID' : { 'S': userID },
     	'Email Address': {'S': userEmail}
      };

     dd.putItem({
         'TableName': 'eaton-user-db',
         'Item': item,
         'Expected': {
         	userEmail: {'Exists' : false}
         }
      }, function(err, data) {
         err && console.log(err);
      });
   };
