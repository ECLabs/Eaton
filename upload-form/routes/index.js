var express = require('express'); 
var router = express.Router();
var multer = require('multer');
var moment = require('moment'); 
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'}); // configuration of region for Amazon Cloud Services
var s3 = new AWS.S3(); //module to access Amazon Cloud Services. S3 
var dynamoDB = new AWS.DynamoDB(); //module to access Amazon Cloud Services. Dymamo DB
var bucketName = 'eaton-resume-bucket'; // name of S3 Bucket
var date = moment().format("MM-DD-YYYY"); // module to form date
var date2 = moment().format("MM-DD-YYYY, h:mm:ss a"); // module to form date
var Chance = require('chance'); //module to calculate a random integer
var chance = new Chance(); // instance of chance module
var winston = require('winston'); // module to create log files
winston.add(winston.transports.File, { filename:"resultsFile.log"});
var storage = multer.memoryStorage(); //module to handle file uploads
var upload = multer({ storage: storage}); // module to handle file uploads
var Client = require('node-rest-client').Client; //module to call a REST API
var indeed = new Client(); // instance of the Indeed API
var CronJob = require('cron').CronJob; //runs a code inside of function at desired interval
var callIndeed = new CronJob('0 * * * * *', function() {
//API Call every 60 seconds
  console.log("Gathering Indeed Data");
  indeed.get("http://api.indeed.com/ads/apisearch?publisher=6268049284529777&q=java&format=json&limit=30&l=washington%2C+dc&sort=date&radius=10&st=&jt=&start=0&fromage=&filter=&latlong=0&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2", function(data, response){
  	var results1 = JSON.parse(data);//first 25 results from api call
  	results1 = results1.results;

  	indeed.get("http://api.indeed.com/ads/apisearch?publisher=6268049284529777&q=java&format=json&limit=25&l=washington%2C+dc&sort=date&radius=10&st=&jt=&start=25&fromage=&filter=&latlong=0&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2", function(data2, response){
  		var results2 = JSON.parse(data2); //next 25 results from api call
  		results2 = results2.results;
  		var results = results1.concat(results2); //combine results into array of 50
  		console.log(results);
  		function mycomparator(a,b) {
  			return parseInt(a.jobkey, 10) - parseInt(b.jobkey, 10);
		}
		results.sort(mycomparator); // sort results by job key
		var s3params2 = {
  		//parameters to connect to s3 bucket
			Bucket: bucketName,
			Key: 'IndeedXMLData',
			Body: results
		};
		var count = 0;
		for(var i = 0; i < results.length; i++){
			var metaParams = {
				"TableName": "eaton-indeed-db",
				"Item": {
					"Table": {"S": "Indeed" },
					"jobTitle": {"S": "" + results[i].jobtitle},
					"jobCompany": {"S": "" + results[i].company},
					"jobLocation": {"S": "" + results[i].formattedLocation},
					"URL": {"S": "" + results[i].url},
					"JobDescription": {"S": "" + results[i].snippet} 
				}
			};
			dynamoDB.putItem(metaParams, function(err, data){
				if(err){
					console.log(err, err.stack);
				}
				else {
					console.log("Successfully added item to Indeed table");
					count++;//count of items uploaded to Dynamo DB
					console.log(count);
				}
				return;	
			});
		}
	
		s3.putObject(s3params2, function(perr, pres){
		//adds file to s3 bucket
			if (perr){
				//log the error if one occurs
				console.log("Error uploading data: ", perr);
			} else {
				//notify the server the the upload was successful 
				console.log("Successfully uploaded data to Eaton Indeed Bucket");
			}
			return;
		});

		//winston.info('JobData', results); //log job results to log file
	
  	}).on('error',function(err){
  		//log the error if one occurs
    	console.log('something went wrong on the request', err.request.options);
  	});
  	
  }).on('error',function(err){
  	//log the error if one occurs
    console.log('something went wrong on the request', err.request.options);
  });
}, null, true, 'America/New_York');

function calculateNumber(){
//returns an integer: random number between 10,000 and 19,9999 

		return chance.integer({min: 10000, max: 19999})
};



/* GET home page. */
router.get('/', function(req, res, next) {

  callIndeed.start();	
  
  res.render('index', { title: 'Upload Form' });
  //render the home page of the application
});

router.post('/', upload.single('myUpload'), function(req, res){
	//method to handle file uploads
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
