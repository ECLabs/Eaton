// controller.js
// ============

/* Internal App Files */
var data_persTravReport = require('./data-layer/pers-trav-report');
var service_api = require('./service-layer/api');

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
		  		data_persTravReport.addTravelRecord(result, res);
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
		  		data_persTravReport.getHistory(result.name, res);
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
			service_api.demo(res);
		});
	}
};