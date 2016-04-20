// api.js
// ============

var AWS = require('aws-sdk'); 
AWS.config.update({ region: "us-east-1" });
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', accessKeyId: "AKIAJBIDCSHBNGY6ECYA", secretAccessKey: "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"});

/* Internal Files */
var object_botboard = require('../object-definitions/botboard');
var data_pers_trav_report = require('./pers-trav-report');

module.exports = {
	putRiskScore: function (name, risk, resp){
		putRiskScoreInDynamoDB(name, risk, resp);
	},
	getRiskScore: function (name, resp){
		getRiskScoreFromDynamoDB(name, resp);
	},
	getTravelFeedLocations: function (limit, callback){
		getTravelFeedLocationsFromDynamoDB(limit, callback);
	},
};

/*
 * Private Methods
 */

var cachedLocations = null;

var tempBernieRiskScores = {};
tempBernieRiskScores.total = "12";
tempBernieRiskScores.computer = "2";
tempBernieRiskScores.finance = "1";
tempBernieRiskScores.foreign_contact = "4";
tempBernieRiskScores.travel = "5";

function getRiskScoreFromDynamoDB(name, resp){
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
		resp.send(data.Items);
	  }     
	});
}

function getTravelFeedLocationsFromDynamoDB(limit, callback){
	var params = {
		"TableName": "eaton-travel-feed",
		"AttributesToGet": [
			"locations",
			"timestamp"
		],
    	"Limit":limit,
    	"Select": "SPECIFIC_ATTRIBUTES",
    	"ConsistentRead": false
	};
	dynamodb.scan(params, function(err, data) {
	  if (err){
	  	console.log(err, err.stack); 
	  } else{
		callback(data.Items);
	  }     
	});
}

function calculateRiskScore(){
	
}

function putRiskScoreInDynamoDB(name, risk, resp){
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
	  }else{
	  	resp.send("done");
	  }
	});
}

function buildBotBoardResponseObject(resp){
	
	
	resp.send();
}
