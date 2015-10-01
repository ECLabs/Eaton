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
var Chance = require('chance');
var chance = new Chance();
var winston = require('winston');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage});
function calculateNumber(){
		return chance.integer({min: 10000, max: 19999})
	};
winston.add(winston.transports.File, { filename:"resultsFile.log"});

/* GET home page. */
router.get('/', function(req, res, next) {
   
  res.render('index', { title: 'Upload Form' });
});

router.post('/', upload.single('myUpload'), function(req, res){
	var randomNumber = calculateNumber();
	var userID = '00' + randomNumber;
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
			"userID": {"S": userID},
			"dateCreated": {"S": date},
			"userRole": {"S": userRole}
		}
	};	
	var idParams = {
		"TableName": "eaton-user-db",
		"IndexName": "userID-index",
		"ExpressionAttributeNames": {"#T": "Table"},
		"ExpressionAttributeValues": {":User": {"S": "User"}, ":userID": {"S": userID}},
		"KeyConditionExpression": '#T = :User AND userID = :userID',
		"ScanIndexForward": false,
		"Limit": 10,
		"Select": "ALL_ATTRIBUTES",
		"ConsistentRead": false
	};
	var idExists = new Boolean(true);
	function modifyVar(obj, val) {
		obj.valueOf = obj.toSource = obj.toString = function(){ return val; };
	}
	function setToFalse(boolVar) {
		modifyVar(boolVar, false);
	}
		dynamoDB.query(idParams, function(err, qData){
			console.log("query started");
			console.log(qData);
			if(err){
				console.log(err);
			}
			if(qData.count > 0){
				console.log("calculating new ID");
				userID = '00' + calculateNumber();
				return;
			}
			else{
				setToFalse(idExists);
			}
			if(idExists.valueOf() == false){
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
							return;
						});
					}
					else {
						console.log("Email already exists");
						userID = data.Item.userID.S;
					}
					
					var resumeParams = {
						"TableName": 'eaton-resume-db',
						"Item": {
							"Table": {"S": "Resume"},
							"userID": {"S": userID},
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
							"userID": {"S": userID},
							"userEmail": {"S": email},
							"userRole": {"S": userRole},
							"jobTitle": {"S": jobTitle},
							"URL": {"S": fileLink}
						}
					}	
						
					if(userRole == 'jobseeker'){
						console.log("job seeker " + userID);
						dynamoDB.putItem(resumeParams, function(err, data){
							if(err){
								console.log(err, err.stack);
							}
							else {
								console.log("Successfully added item to Resume table");
							}
							return;
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
							return;
						});
					}
					var s3params = {
						Bucket: bucketName,
						Key: req.file.originalname,
						Body: req.file.buffer
					};
					s3.putObject(s3params, function(perr, pres){
						if (perr){
							console.log("Error uploading data: ", perr);
						} else {
							console.log("Successfully uploaded data to Eaton Resume Bucket");
						}
						return;
					});
					return;
				});
			}
			return;
		});	
	res.end("File uploaded");
});

module.exports = router;
