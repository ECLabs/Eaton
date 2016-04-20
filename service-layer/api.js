// api.js
// ============

/* Internal App Files */
var data_api = require('../data-layer/api');
var data_pers_trav_report = require('../data-layer/pers-trav-report');
var object_botboard = require('../object-definitions/botboard');
var cachedLocationForDemo = [];

module.exports = {
	demo: function(resp){
		(function(response){
			//Local variables belonging to response object (indivual transaction)
			var resp = response;
			var botboard = object_botboard.new();
			var currentCallBackCount = 0;
			var desiredCallBackCount = 2;
			
			botboard.insider_name = "Bernie Sanders";
			
			data_api.getTravelFeedLocations(60, function(retObj){
				cachedLocationForDemo = [];
				for(var i=0; i<retObj.length; i++){
					var tweet = object_botboard.new_tweet();
					tweet.location.name = retObj[i].locations.L[0].M.name.S;
					tweet.location.latitude = retObj[i].locations.L[0].M.latitude.N;
					tweet.location.longitude = retObj[i].locations.L[0].M.longitude.N;
					tweet.create_date = retObj[i].timestamp.N;
					
					if(i < 30){
						botboard.tweets.push(tweet);
					}else{
						cachedLocationForDemo.push(tweet);
					}
				}
				
				currentCallBackCount++;
				sendResponse(currentCallBackCount, desiredCallBackCount, botboard, resp);
			});
			
			data_pers_trav_report.getHistory(botboard.insider_name, function(retObj){
				for(var i=0; i<retObj.length; i++){
					var report = object_botboard.new_reported_travel();
					report.location_name = retObj[i].location.S;
					report.reported_year = new Date(parseInt(retObj[i].arrival.N)).getFullYear();
					
					botboard.reported_travel.push(report);
				}
				
				currentCallBackCount++;
				sendResponse(currentCallBackCount, desiredCallBackCount, botboard, resp);
			});
		})(resp);
	}
};

/* Private Methods */

function sendResponse(currentCallBackCount, desiredCallBackCount, payload, resp){
	if(currentCallBackCount == desiredCallBackCount){
		resp.send(payload);
	}
}
