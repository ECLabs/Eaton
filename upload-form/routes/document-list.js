vZr express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dynamoDB = new AWS.DynamoDB();


// GET documents page. 
router.get('/', function(req, res, next) {
	var resumeParams = {
		"TableName": "eaton-resume-db",
		"AttributesToGet": ['userID', 'userEmail', 'userRole', 'Table', 'URL'],
		"IndexName": "userID-index",
		"KeyConditions": {
			"Table": {
				ComparisonOperator: 'EQ',
				AttributeValueList: [{"S": "Resume"},],
			},
		},
		"ScanIndexForward": false,
		"Limit": 10,
		"Select": "SPECIFIC_ATTRIBUTES",
		"ConsistentRead": false
	};
	var jobParams = {
		"TableName": "eaton-jobdescription-db",
		"AttributesToGet": ['userID', 'userEmail', 'userRole', 'Table', 'URL'],
		"IndexName": "userID-index",
		"KeyConditions": {
			"Table": {
				ComparisonOperator: 'EQ',
				AttributeValueList: [{"S": "JobDescription"},],
			},
		},
		"ScanIndexForward": false,
		"Limit": 10,
		"Select": "SPECIFIC_ATTRIBUTES",
		"ConsistentRead": false
	};
	dynamoDB.query(resumeParams, function(err, data){
		if(err){
			console.log(err);
			return;
		}
		var x = data.Items;

		dynamoDB.query(jobParams, function(err, data2){
			if(err){
				console.log(err);
				return;
			}
			var y = data2.Items;
			x = y.concat(x);
			res.render('document-list', { title: 'Uploaded Documents', myDocuments: x});
		});
	});
});


module.exports = router;
