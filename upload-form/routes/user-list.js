var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dynamoDB = new AWS.DynamoDB();


//GET Users Page
router.get('/', function(req, res, next){
	var params = {
		"TableName": "eaton-user-db",
		"AttributesToGet": ['userEmail', 'userRole', 'dateCreated'],
		"IndexName": "userEmail-index",
		"KeyConditions": {
			"Table": {
				ComparisonOperator: 'EQ',
				AttributeValueList: [{"S": "User"},],
			},
		},
		"ScanIndexForward": false,
		"Limit": 10,
		"Select": "SPECIFIC_ATTRIBUTES",
		"ConsistentRead": false
	};
	dynamoDB.query(params, function(err, data){
		var myData;
		if(err){
			console.log(err);
			return;
		}
		else{
			myData = data.Items;
		}
		res.render('user-list', { title: 'List of Users', "myUsers": myData});
	});

});


module.exports = router;