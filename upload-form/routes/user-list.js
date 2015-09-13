var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.update({'region': 'us-east-1'});
var dynamoDB = new AWS.DynamoDB();

router.get('/', function(req, res, next){
	res.render('user-list', { title: 'List of Users'});
});


module.exports = router;