var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dynamoDB = new AWS.DynamoDB();


// GET documents page. 
router.get('/', function(req, res, next) {
	var params = {
		"TableName": "eaton-resume-db",
		"IndexName": "RecordCreateDate",
		"KeyConditions": {
			"RecordCreateDate": {
				ComparisonOperator: 'EQ',
				AttributeValueList: [{"S": "09-01-2015"},],
			},
		},
		"ScanIndexForward": false,
		"Limit": 10,
		"Select": "ALL_ATTRIBUTES",
		"ConsistentRead": false
	};
	dynamoDB.query(params, function(err, data){
		var user = {};
		if(err){
			console.log(err);
			return;
		}
		else{
			console.log(data);
		}
	
	});
	res.render('document-list', { title: 'Uploaded Documents'});
});


module.exports = router;