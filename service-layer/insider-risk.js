// insider-risk.js
// ============

/* Internal App Files */
var data_insider_risk = require('../data-layer/insider-risk');
var data_pers_trav_report = require('../data-layer/pers-trav-report');
var object_botboard = require('../object-definitions/botboard');
var cachedLocationForDemo = [];

module.exports = {
	demo: function(resp, limit){
		run(resp, limit);
	}
};

/* Private Methods */

var tempBernieRiskScores = {};
tempBernieRiskScores.total = 12;
tempBernieRiskScores.computer = 15;
tempBernieRiskScores.finance = 30;
tempBernieRiskScores.foreign_contact = 2;
tempBernieRiskScores.travel = 55;

function run(resp, limit){
	(function(response){
			//Local variables belonging to response object (indivual transaction)
			var resp = response;
			var botboard = object_botboard.new();
			var currentCallBackCount = 0;
			var desiredCallBackCount = 3;
			var locations_counts = [];
			var new_location_counts = {};
			var tweet_limit = limit;
			var external_call = false;
			
			if(tweet_limit == undefined){
				tweet_limit = 60;
				external_call = true;
			}
			
			botboard.insider_name = "Bernie Sanders";
			
			data_insider_risk.getTravelFeedLocations(tweet_limit, function(retObj){
				cachedLocationForDemo = [];
				for(var i=0; i<retObj.length; i++){
					if(retObj[i].locations.L[0] != undefined){
						var tweet = object_botboard.new_tweet();
						tweet.location.name = retObj[i].locations.L[0].M.name.S;
						tweet.location.latitude = retObj[i].locations.L[0].M.latitude.N;
						tweet.location.longitude = retObj[i].locations.L[0].M.longitude.N;
						tweet.create_date = retObj[i].timestamp.N;
						
						if(new_location_counts[tweet.location.name] == undefined){
							new_location_counts[tweet.location.name] = 1;
						}else{
							new_location_counts[tweet.location.name]++; 
						}
						
						if(i < 30){
							botboard.tweets.push(tweet);
						}else{
							cachedLocationForDemo.push(tweet);
						}
					}
				}
				
				for(var key in new_location_counts){
					var location_count_object = {};
					location_count_object.name = botboard.insider_name;
					location_count_object.country = key;
					location_count_object.count = new_location_counts[key];
					data_insider_risk.updateTweetLocationsCounts(location_count_object);
				}
				
				currentCallBackCount++;
				calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
			});
			
			data_pers_trav_report.getHistory(botboard.insider_name, function(retObj){
				for(var i=0; i<retObj.length; i++){
					var report = object_botboard.new_reported_travel();
					report.location_name = retObj[i].location.S;
					report.reported_year = new Date(parseInt(retObj[i].arrival.N)).getFullYear();
					
					botboard.reported_travel.push(report);
				}
				
				currentCallBackCount++;
				calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
			});
			
			data_insider_risk.getTweetLocationsCounts(botboard.insider_name, function(retObj){
				locations_counts = retObj;
				
				currentCallBackCount++;
				calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
			});
			
			function calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount){
				if(currentCallBackCount == desiredCallBackCount){
					
					//Calculate
					var travel_risk_score = 0;
					var unreported_locations = 0;
					var total_location_count = 0;
					var reported = false;
					for(var i=0; i<locations_counts.length; i++){
						reported = false;
						for(var n=0; n<botboard.reported_travel.length; n++){
							if(botboard.reported_travel[n].location_name.toLowerCase() == locations_counts[i].country.S.toLowerCase()){
								reported = true;
								break;
							}
						}
						
						total_location_count += locations_counts[i].feed_count.N;
						
						if(!reported){
							unreported_locations += locations_counts[i].feed_count.N;
						}
					}
					
					console.log("total_location_count="+total_location_count)
					console.log("unreported_locations="+unreported_locations)
					
					if(unreported_locations > 0){
						travel_risk_score = Math.round(total_location_count/unreported_locations);
					}else{
						travel_risk_score = 100;
					}
					
					botboard.risk_scores.total = Math.round((tempBernieRiskScores.computer + tempBernieRiskScores.finance +
												tempBernieRiskScores.foreign_contact + travel_risk_score)/4);
					botboard.risk_scores.computer = tempBernieRiskScores.computer;
					botboard.risk_scores.finance = tempBernieRiskScores.finance;
					botboard.risk_scores.foreign_contacts = tempBernieRiskScores.foreign_contact;
					botboard.risk_scores.travel = travel_risk_score;
					
					//Send
					if(external_call){ //External api call
						resp.send(botboard);
					}else{
						//TODO create post call
					}
					
					//Save
					var new_risk_score = {};
					new_risk_score.total = botboard.risk_scores.total;
					new_risk_score.computer = botboard.risk_scores.computer;
					new_risk_score.finance = botboard.risk_scores.finance;
					new_risk_score.foreign_contact = botboard.risk_scores.foreign_contacts;
					new_risk_score.travel = botboard.risk_scores.travel;
					
					data_insider_risk.putRiskScore(botboard.insider_name, new_risk_score);
					
					//Kick off slow loop
					if(external_call){ //External api call
						//runSlowLoop();
						console.log("RUN SLOW LOOP")
					}
				}
			}
			
		})(resp);
}

function runSlowLoop(){
	var elapsed_time = 0;
	var random_number = 0;
	var high = 6;
	var low = 3;
	
	//This immediately fires off 30 jobs, at spread out randomized times
	for(var i=0; i<30; i++){
		random_number = Math.floor(Math.random() * hgih) + low;
		setTimeout(function(){
			run(null, 1);
		}, elapsed_time + random_number);
		elapsed_time += random_number;
	}
}
