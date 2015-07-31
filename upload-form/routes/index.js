var express = require('express');
var router = express.Router();
var multer = require('multer');
var moment = require('moment');
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dynamoDB = new AWS.DynamoDB();
var s3 = new AWS.S3();
var bucketName = 'eaton-resume-bucket';
var date = moment().format("MM-DD-YYYY");
var emailExists;
var userID;

router.use(multer({ 
	dest: './uploads/',
	rename: function(fieldname, filename){
		return filename;
	},
	onFileUploadStart: function (file, data, req, res) {
		var email = req.req.body.email;
		var fileType = file.extension;
		var jobTitle = req.req.body.jobTitle;
		var fileLink = "https://s3.amazonaws.com/eaton-resume-bucket/" + file.name;
		var userRole = req.req.body.user;
		var s3params = {
			Bucket: bucketName,
			Key: file.name,
			Body: data
		};
		
		var checkEmail = {
			"TableName": 'eaton-user-db',
			"Key": {
				"userEmail": {"S": email},
			}
		};
		var userParams = {
			"TableName": 'eaton-user-db',
			"Item": {
				"userEmail": {"S": email},
				"userID": {"S": email},
				"dateCreated": {"S": date},
				"userRole": {"S": userRole}
			}
		};
		var resumeParams = {
			"TableName": 'eaton-resume-db',
			"Item": {
				"User ID": {"S": email},
				"File Type": {"S": fileType},
				"Job Title": {"S": jobTitle},
				"Record Create Date": {"S": date},
				"URL": {"S": fileLink}
			}
		}

		var jobParams = {
			"TableName": 'eaton-jobdescription-db',
			"Item": {
				"User ID": {"S": email},
				"File Type": {"S": fileType},
				"Job Title": {"S": jobTitle},
				"Job Description ID": {"S": "x"},
				"Date Created": {"S": date},
				"URL Address": {"S": fileLink}
			}
		}
		var emailExists = false;
		dynamoDB.getItem(checkEmail, function(err, data){
			if(data.Item === undefined){
				console.log('Upload is starting ...');
				dynamoDB.putItem(userParams, function(err, data){
					if(err){
						console.log(err, err.stack);
					}
					else {
						console.log("Successfully added item to table");
					}
				});
			}
			else {
				console.log("Email already exists");
				console.log(data);
				var x = data.Item.userID.S;
				console.log(x);
				emailExists = true;
				return;
			}
		});
		
		dynamoDB.putItem(resumeParams, function(err, data){
			if(err){
				console.log(err, err.stack);
			}
			else {
				console.log("Successfully added item to table");
			}
		});
		dynamoDB.putItem(jobParams, function(err, data){
			if(err){
				console.log(err, err.stack);
			}
			else {
				console.log("Successfully added item to table");
			}
		});
		console.log(emailExists);
		if(emailExists === false){
			s3.putObject(s3params, function(perr, pres){
				if (perr){
					console.log("Error uploading data: ", perr);
				} else {
					console.log("Successfully uploaded data to Eaton Resume Bucket");
				}
			});
		}
		else{
			console.log("File exists already");
		}
		
	}
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload Form' });
});

router.post('/', function(req, res){
		//console.log(req.files);
		//console.log(req.body);
		res.end("File uploaded.");
});

module.exports = router;
