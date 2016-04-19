// api.js
// ============

/* Internal App Files */
//var data_api = require('./data-layer/api');
var object_botboard = require('../object-definitions/botboard');

module.exports = {
	demo: function(resp){
		resp.send(object_botboard.new())
	}
};