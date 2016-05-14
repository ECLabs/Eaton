// insider-risk.js
// ============
var request = require('request');

/* Internal App Files */
var data_insider_risk = require('../data-layer/insider-risk');
var data_pers_trav_report = require('../data-layer/pers-trav-report');
var object_botboard = require('../object-definitions/botboard');
var cachedLocationForDemo = [];
var new_location_counts = {};
var demoPostCount = 0;

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
			var tweet_limit = limit;
			var external_call = false;
			var self_report = false;
			
			if(tweet_limit == undefined){
				tweet_limit = 30;
				external_call = true;
			}else if(tweet_limit == 0){
				self_report = true;
			}
			
			botboard.insider_name = "Bernie Sanders";
			
			if(!self_report){
				if(external_call){
					data_insider_risk.getTravelFeedLocations(tweet_limit, function(retObj){
						demoPostCount = 0;
						cachedLocationForDemo = [];
						new_location_counts = {};
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
								
								cachedLocationForDemo.unshift(tweet);
							}
						}
						
						var location_count_object = {};
						location_count_object.name = botboard.insider_name;
						location_count_object.country = cachedLocationForDemo[demoPostCount].location.name;
						location_count_object.count = new_location_counts[cachedLocationForDemo[demoPostCount].location.name];
						location_count_object.year = new Date().getFullYear().toString();
						data_insider_risk.updateTweetLocationsCounts(location_count_object);
						
						currentCallBackCount++;
						calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
					});
				}else{
					console.log("demoPostCount="+demoPostCount)
					
					var location_count_object = {};
					location_count_object.name = botboard.insider_name;
					location_count_object.country = cachedLocationForDemo[demoPostCount].location.name;
					location_count_object.count = new_location_counts[cachedLocationForDemo[demoPostCount].location.name];
					location_count_object.year = new Date().getFullYear().toString();
					data_insider_risk.updateTweetLocationsCounts(location_count_object);
					
					botboard.tweets.push(cachedLocationForDemo[demoPostCount]);
					
					currentCallBackCount++;
					calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
				}
			}else{
				currentCallBackCount++;
				calculateRiskSendAndSave(currentCallBackCount, desiredCallBackCount);
			}
			
			data_pers_trav_report.getHistory(botboard.insider_name, function(retObj){
				for(var i=0; i<retObj.length; i++){
					var report = object_botboard.new_reported_travel();
					report.location_name = retObj[i].location.S;
					report.reported_year = new Date(parseInt(retObj[i].arrival.N)).getFullYear();
					
					botboard.travel.push(report);
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
					var unreported_location_list = [];
					
					/******* START DEMO TEMP CODE *******/
					var unreported_location_list_demo = [];
					for(var i=0; i<=demoPostCount; i++){
						
						reported = false;
						for(var n=0; n<botboard.travel.length; n++){
							if(botboard.travel[n].location_name.toLowerCase() == cachedLocationForDemo[i].location.name.toLowerCase()){
								reported = true;
								break;
							}
						}

						total_location_count++;
						
						if(!reported){
							var dup = false;
							for(var k=0; k<unreported_location_list.length; k++){
								if(unreported_location_list[k].location_name == cachedLocationForDemo[i].location.name){
									dup = true;
									break;
								}
							}
							if(!dup){
								var unreported_location = {};
								unreported_location.location_name = cachedLocationForDemo[i].location.name;
								unreported_location.reported_year = null;
								unreported_location_list.push(unreported_location);
							}
							unreported_locations++;
						}
					}
					
					/******* END DEMO TEMP CODE *******/
					
					
					/******* START REAL CODE *******/
					/*for(var i=0; i<locations_counts.length; i++){
						
						reported = false;
						for(var n=0; n<botboard.travel.length; n++){
							if(botboard.travel[n].location_name.toLowerCase() == locations_counts[i].country.S.toLowerCase()){
								reported = true;
								break;
							}
						}
						
						total_location_count += parseInt(locations_counts[i].feed_count.N);
						
						if(!reported){
							var unreported_location = {};
							unreported_location.location_name = locations_counts[i].country.S;
							unreported_location.reported_year = null;
							unreported_location_list.push(unreported_location);
							unreported_locations += parseInt(locations_counts[i].feed_count.N);
						}
					}
					*/
					/******* END REAL CODE *******/
					
					//Add unreported locations to the travel array, ensuring the self reports are last
					unreported_location_list = unreported_location_list.concat(botboard.travel);
					botboard.travel = unreported_location_list;
					
					console.log("botboard="+JSON.stringify(botboard))
					
					travel_risk_score = Math.round((unreported_locations/total_location_count)*100);
					
					botboard.risk_scores.total = Math.round((tempBernieRiskScores.computer + tempBernieRiskScores.finance +
												tempBernieRiskScores.foreign_contact + travel_risk_score)/4);
					botboard.risk_scores.computer = tempBernieRiskScores.computer;
					botboard.risk_scores.finance = tempBernieRiskScores.finance;
					botboard.risk_scores.foreign_contacts = tempBernieRiskScores.foreign_contact;
					botboard.risk_scores.travel = travel_risk_score;
					
					//Send
					if(external_call && !self_report){ //External api call
						resp.send(botboard);
					}else{
						postToBotBoard(botboard);
						demoPostCount++;
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
					if(external_call && !self_report){ //External api call
						runSlowLoop();
					}
				}
			}
			
		})(resp);
}

function runSlowLoop(){
	var elapsed_time = 0;
	var random_number = 0;
	var high = 6000;
	var low = 3000;
	
	//This immediately fires off 30 jobs (not including the initial one), at spread out randomized times
	for(var i=0; i<29; i++){
		random_number = Math.floor(Math.random() * high) + low;
		setTimeout(function(){
			run(null, 1);
		}, elapsed_time + random_number);
		elapsed_time += random_number;
	}
}

function postToBotBoard(jsonObject){
	request({
	    url: "http://upboardlb-1838760386.us-east-1.elb.amazonaws.com:8080/feed/eaton",
	    method: "POST",
	    json: true,  
	    body: jsonObject
	}, function (error, response, body){
	    console.log("BotBoard response = "+ JSON.stringify(response));
	});
}
