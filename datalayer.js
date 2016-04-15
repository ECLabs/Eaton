// datalayer.js
// ============
module.exports = {
	getHistory: function (name, resp){
		var returnArray = [];
		
		for(var i=0; i<dataTable.length; i++){
			if(dataTable[i].name == name){
				returnArray.push(dataTable[i]);
			}
		}
		
		resp.send(returnArray);
	},
	addTravelRecord: function (object){
		dataTable.push(object);
	}
};

//Temporary
var dataTable = [];
