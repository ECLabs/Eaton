// botboard.js
// ============

module.exports = {
	new: function(){
		var object = {};
		
		object.insider_name = "";
		object.risk_scores = newRiskScore();
		object.tweets = [];
		object.reported_travel = [];
		
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

function newRiskScore(){
	var object = {};
		
	object.total = 0;
	object.computer = 0;
	object.finance = 0;
	object.foreign_contacts = 0;
	object.travel = 0;
	
	return object;
}
