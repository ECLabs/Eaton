// insider-risk.js
// ============

var AWS = require('aws-sdk'); 
AWS.config.update({ region: "us-east-1" });
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

/* Internal Files */
var object_botboard = require('../object-definitions/botboard');
var data_pers_trav_report = require('./pers-trav-report');

module.exports = {
	putRiskScore: function (name, risk){
		putRiskScoreInDynamoDB(name, risk);
	},
	getRiskScore: function (name, resp){
		getRiskScoreFromDynamoDB(name, resp);
	},
	getTravelFeedLocations: function (limit, callback){
		getTravelFeedLocationsFromDynamoDB(limit, callback);
	},
	getTweetLocationsCounts: function (name, callback){
		getTweetLocationsCountsFromDynamoDB(name, callback);
	},
	updateTweetLocationsCounts: function (location_count_object){
		updateTweetLocationsCountsInDynamoDB(location_count_object);
	},
};

/*
 * Private Methods
 */

function getRiskScoreFromDynamoDB(name, callback){
	var returnArray = [];
		
	var params = {
		"TableName": "eaton-insider-risk",
		"KeyConditions": { 
	        "name": {
	            ComparisonOperator: 'EQ', 
	            AttributeValueList: [ { "S": name } ],
	        }
    	},
    	"ScanIndexForward": false,
    	"Select": "ALL_ATTRIBUTES",
    	"ConsistentRead": true
	};
	dynamodb.query(params, function(err, data) {
	  if (err){
	  	console.log(err, err.stack); 
	  } else{
		callback(data.Items);
	  }     
	});
}

function getTravelFeedLocationsFromDynamoDB(limit, callback){
	var params = {
		"TableName": "eaton-insider-external-sources-feed",
		"IndexName": "state-timestamp-index",
		"KeyConditions": { 
	        "state": {
	            ComparisonOperator: 'EQ', 
	            AttributeValueList: [ { "S": "end" } ],
	        }
    	},
		"AttributesToGet": [
			"locations",
			"timestamp"
		],
    	"Limit":limit,
    	"ScanIndexForward": false,
    	"Select": "SPECIFIC_ATTRIBUTES",
    	"ConsistentRead": false
	};
	dynamodb.query(params, function(err, data) {
	  if (err){
	  	console.log(err, err.stack); 
	  } else{
		callback(data.Items);
	  }     
	});
}

function updateTweetLocationsCountsInDynamoDB(location_count_object){
	console.log(JSON.stringify(location_count_object))
	var params = {
		"TableName":"eaton-external-feed-country-counter",
		"Key" : {
			"name":{"S":location_count_object.name},
			"country":{"S":location_count_object.country}
	    },
	    "ConditionExpression":"reported_year = :reported_year",
		"UpdateExpression" : "SET feed_count = feed_count + :newCount",
	    "ExpressionAttributeValues" : {
	        ":newCount" : {"N" : location_count_object.count.toString()},
	        ":reported_year" : {"N" : location_count_object.year}
	    }
	};
	dynamodb.updateItem(params, function(err, data) {
	  if (err) {
	  	if(err.statusCode == 400){
	  		console.log("adding new row")
	  		putTweetLocationsCountsInDynamoDB(location_count_object);
	  	}else{
	  		console.log(err, err.stack); 
	  	}
	  }else{
	  	console.log("updating row")
	  }
	});
}

function putTweetLocationsCountsInDynamoDB(location_count_object){
	var params = {
		"TableName":"eaton-external-feed-country-counter",
		"Item": {
			"name":{"S":location_count_object.name},
			"country":{"S":location_count_object.country},
			"feed_count":{"N":location_count_object.count.toString()},
			"reported_year":{"N":new Date().getFullYear().toString()}		}
	};
	dynamodb.putItem(params, function(err, data) {
	  if (err) {
	  	console.log(err, err.stack); 
	  }
	});
}

function putRiskScoreInDynamoDB(name, risk){
	var params = {
		"TableName":"eaton-insider-risk",
		"Item": {
			"name":{"S":name},
			"create_date":{"N":(new Date().getTime().toString())},
			"total":{"N":risk.total.toString()},
			"computer":{"N":risk.computer.toString()},
			"finance":{"N":risk.finance.toString()},
			"foreign_contact":{"N":risk.foreign_contact.toString()},
			"travel":{"N":risk.travel.toString()},
		}
	};
	dynamodb.putItem(params, function(err, data) {
	  if (err) {
	  	console.log(err, err.stack); 
	  }
	});
}

function getTweetLocationsCountsFromDynamoDB(name, callback){
	var params = {
		"TableName": "eaton-external-feed-country-counter",
		"KeyConditions": { 
	        "name": {
	            ComparisonOperator: 'EQ', 
	            AttributeValueList: [ { "S": name } ],
	        }
    	},
    	"Select": "ALL_ATTRIBUTES",
    	"ConsistentRead": false
	};
	dynamodb.query(params, function(err, data) {
	  if (err){
	  	console.log(err, err.stack); 
	  } else{
		callback(data.Items);
	  }     
	});
}
