// botboard.js
// ============

module.exports = {
	new: function(){
		var object = {};
		
		object.insider_name = "";
		object.risk_scores = [];
		object.tweets = [];
		object.reported_travel = [];
		
		return object;
	},
	new_risk_score: function(){
		var object = {};
		
		object.name = "";
		object.value = 0;
		
		return object;
	},
	new_tweet: function(){
		var object = {};
		
		object.location = {};
		object.location.name = "";
		object.location.latitude = 0;
		object.location.longitude = 0;
		
		object.text = "";
		object.create_date = 0;
		
		return object;
	},
	new_reported_travel: function(){
		var object = {};
		
		object.location_name = "";
		object.reported_year = "";
		
		return object;
	},
};