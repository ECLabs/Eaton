// pers-trav-report.js
// ============
var AWS = require('aws-sdk'); 
AWS.config.update({ region: "us-east-1" });
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
	getHistory: function (name, callback){
		getHistoryFromDynamoDB(name, callback);
	},
	addTravelRecord: function (object, callback){
		addTravelRecordToDynamoDB(object, callback);
	}
};

/*
 * Private Methods
 */

function getHistoryFromDynamoDB(name, callback){
	var returnArray = [];
		
	var params = {
		"TableName": "eaton-travel-self-report",
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

function addTravelRecordToDynamoDB(object, callback){
	var params = {
		"TableName":"eaton-travel-self-report",
		"Item": {
			"name":{"S":object.name},
			"arrival":{"N":Date.parse(object.arrival).toString()},
			"departure":{"N":Date.parse(object.departure).toString()},
			"location":{"S":object.location}
		}
	};
	dynamodb.putItem(params, function(err, data) {
	  if (err) {
	  	console.log(err, err.stack); 
	  }else{
	  	getHistoryFromDynamoDB(object.name, callback);
	  }
	});
}
