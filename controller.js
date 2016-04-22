// controller.js
// ============

var qs = require('querystring');

/* Internal App Files */
var data_pers_trav_report = require('./data-layer/pers-trav-report');
var service_insider_risk = require('./service-layer/insider-risk');

module.exports = {
	main: function(app){
		/*
		 * Add /heatbeat to base url to see if application is running
		 */
		app.get('/heartbeat', function (req, res) {
		  //TODO add database queries and anything else to exercise all third party communications to provide a better check
		  res.send('I\'m alive!');
		});
		
		/*
		 * Form submission
		 */
		app.post('/submit', function (req, res) {
		  var body = '';
		  
		  req.on('data', function (data) {
		  	body += data;
		  });
		  
		  req.on('end', function(){
		  	var result = qs.parse(body);
		  	
		  	if(result.name != undefined){
		  		data_pers_trav_report.addTravelRecord(result, function(retObj){
					res.send(retObj);
					
					//Fire post to BotBoard
					service_insider_risk.demo(res, 0);
				});
		  	}else{
		  		res.send("error: name is undefined");
		  	}
		  	
		  	console.log(result);
		  });
		});
		
		/*
		 * History retrieval
		 */
		app.post('/history', function (req, res) {
		  var body = '';
		  
		  req.on('data', function (data) {
		  	body += data;
		  });
		  
		  req.on('end', function(){
		  	var result = qs.parse(body);
		  	
		  	if(result.name != undefined){
		  		data_pers_trav_report.getHistory(result.name, function(retObj){
					res.send(retObj);
				});
		  	}else{
		  		res.send("error: name is undefined");
		  	}
		  	
		  	console.log(result);
		  });
		});

		/*
		 * DEMO
		 */
		app.get('/api/demo', function (req, res) {
			service_insider_risk.demo(res);
		});
	}
};