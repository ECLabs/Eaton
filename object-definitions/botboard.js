// botboard.js
// ============

module.exports = {
	new: function(){
		var object = {};
		
		object.insider_name = "";
		object.risk_scores = newRiskScore();
		object.tweets = [];
		object.travel = [];
		
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
		
	object["A: Allegiance to the United States"] = 0;
	object["B: Foreign Influence"] = 0;
	object["C: Foreign Preference"] = 0;
	object["D: Sexual Behavior"] = 0;
	object["E: Personal Conduct"] = 0;
	object["F: Financial Considerations"] = 0;
	object["G: Alcohol Consumption"] = 0;
	object["H: Drug Involvement"] = 0;
	object["I: Psychological Conditions"] = 0;
	object["J: Criminal Conduct"] = 0;
	object["K: Handling Protected Information"] = 0;
	object["L: Outside Activities"] = 0;
	object["M: Use of Information Technology Systems"] = 0;
	
	return object;
}
