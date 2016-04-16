// datalayer.js
// ============
var AWS = require('aws-sdk'); 
AWS.config.update({ accessKeyId: "AKIAIFEJDU4ZOMYYT4FQ", secretAccessKey: "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", region: "us-east-1" });
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
	getHistory: function (name, resp){
		getHistoryFromDynamoDB(name, resp);
	},
	addTravelRecord: function (object, resp){
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
		  	getHistoryFromDynamoDB(object.name, resp);
		  }
		});
	}
};

/*
 * Private Methods
 */

function getHistoryFromDynamoDB(name, resp){
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
		resp.send(data.Items);
	  }     
	});
}
