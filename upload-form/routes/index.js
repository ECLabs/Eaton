var express = require('express');
var router = express.Router();
var multer = require('multer');
var moment = require('moment');
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var s3 = new AWS.S3();
var dynamoDB = new AWS.DynamoDB();
var bucketName = 'eaton-resume-bucket';
var date = moment().format("MM-DD-YYYY");
var date2 = moment().format("MM-DD-YYYY, h:mm:ss a");
var emailExists;
var userID;
var winston = require('winston');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload Form' });
});

router.post('/', upload.single('myUpload'), function(req, res){
	var temp = req.file.originalname;
	var urlName = '';
	for(var i = 0; i < temp.length; i++){ 
		if(temp[i] == ' '){
			urlName = urlName + '+' + temp[i+1];
			i++;
		}
		else{ 
			urlName = urlName + temp[i];
		}
	}
	var email = req.body.email;
	var fileType;
	var userRole = req.body.user;
	var jobTitle;
	var fileLink = "https://s3.amazonaws.com/eaton-resume-bucket/" + urlName;
	
	

	if(userRole == 'jobseeker'){
		jobTitle = req.body.jobTitle;
	}
	else if(userRole == 'recruiter'){
		jobTitle = req.body.jobDescription;
	}

	if(req.file.mimetype === 'application/pdf'){
		fileType = 'pdf';
	}
	else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
		fileType = 'docx';
	}
	else if (req.file.mimetype === 'application/rtf'){
		fileType = 'rtf';
	}
	else {
		fileType = 'unknown fileType';
	}

	winston.add(winston.transports.File, { filename:"resultsFile.log"});
	winston.info('Date Created', {timestamp: date2});
	winston.info('Email', email),
	winston.info('Job Title', jobTitle),
	winston.info('User Role', userRole);
		
	var checkEmail = {
		"Key": {
			"Table": {"S": "User"},
			"userEmail": {"S": email}
		},
		"TableName": 'eaton-user-db',
	};
	var userParams = {
		"TableName": 'eaton-user-db',
		"Item": {
			"Table": {"S": "User"},
			"userEmail": {"S": email},
			"userID": {"S": email},
			"dateCreated": {"S": date},
			"userRole": {"S": userRole}
		}
	};
	var resumeParams = {
		"TableName": 'eaton-resume-db',
		"Item": {
			"Table": {"S": "Resume"},
			"userID": {"S": email},
			"userEmail": {"S": email},
			"userRole": {"S": userRole},
			"jobTitle": {"S": jobTitle},
			"URL": {"S": fileLink}
		}
	}
	var jobParams = {
		"TableName": 'eaton-jobdescription-db',
		"Item": {
			"Table": {"S": "JobDescription"},
			"userID": {"S": email},
			"userEmail": {"S": email},
			"userRole": {"S": userRole},
			"jobTitle": {"S": jobTitle},
			"URL": {"S": fileLink}
		}
	}
	var emailExists = new Boolean(false);
	function modifyVar(obj, val) {
		obj.valueOf = obj.toSource = obj.toString = function(){ return val; };
	}
	function setToTrue(boolVar) {
		modifyVar(boolVar, true);
	}			
	dynamoDB.getItem(checkEmail, function(err, data){
		if(Object.keys(data).length < 1){
			console.log('Upload is starting ...');
			dynamoDB.putItem(userParams, function(err, data){
				if(err){
					console.log(err, err.stack);
				}
				else {
					console.log("Successfully added item to User table");
				}
			});
		}
		else {
			console.log("Email already exists");
			setToTrue(emailExists);
		}
		if(userRole == 'jobseeker'){
			dynamoDB.putItem(resumeParams, function(err, data){
				if(err){
					console.log(err, err.stack);
				}
				else {
					console.log("Successfully added item to Resume table");
				}
			});
		}
		else if(userRole == 'recruiter'){
			dynamoDB.putItem(jobParams, function(err, data){
				if(err){
					console.log(err, err.stack);
				}
				else {
					console.log("Successfully added item to Job table");
				}
			});
		}
		
		var s3params = {
			Bucket: bucketName,
			Key: req.file.originalname,
			Body: req.file.buffer
		};
		if(emailExists.valueOf() == false ){
			s3.putObject(s3params, function(perr, pres){
				if (perr){
					console.log("Error uploading data: ", perr);
				} else {
					console.log("Successfully uploaded data to Eaton Resume Bucket");
				}
			});
		}
		
	});
	res.end("File uploaded");
});

module.exports = router;
