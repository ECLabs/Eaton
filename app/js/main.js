var baseUrl = 'http://ectechnology-eaton.us-east-1.elasticbeanstalk.com';
var port = ':8081/';

$(document).ready(function(){
	$(".content .list-group").hide();
	
	$("#submit-button").on('click', function(){
		submit();
	});
	
	$("#new").on('click', function(){
		$(this).tab("show");
		$('#myTabs a[href="#history"]').tab('hide');
		$(".content .list-group").hide();
		$(".content .input-group").show();
	});
	
	$("#history").on('click', function(){
		$(this).tab("show");
		$('#myTabs a[href="#new"]').tab('hide');
		$(".content .input-group").hide();
		$(".content .list-group").show();
	});
	
	$("#user").on('change', function(){
		getHistory($(this).val());
	});
	
	setupDatePickers();
	
	getHistory("Bernie Sanders");
	
	var substringMatcher = function(strs) {
	  return function findMatches(q, cb) {
	    var matches, substringRegex;
	
	    // an array that will be populated with substring matches
	    matches = [];
	
	    // regex used to determine if a string contains the substring `q`
	    substrRegex = new RegExp(q, 'i');
	
	    // iterate through the pool of strings and for any string that
	    // contains the substring `q`, add it to the `matches` array
	    $.each(strs, function(i, str) {
	      if (substrRegex.test(str)) {
	        matches.push(str);
	      }
	    });
	
	    cb(matches);
	  };
	};

	var people = ['Bernie Sanders', 'Ted Cruz'];

	$('.typeahead').typeahead({
	  hint: true,
	  highlight: true,
	  minLength: 1
	},
	{
	  name: 'people',
	  source: substringMatcher(people)
	});
});

function submit(){
	var form = {};
	form.name = $("#name").val();
	form.location = $("#location").val();
	form.arrival = $("#arrival").val();
	form.departure = $("#departure").val();
	
	$("#history").click();
	
	var request = $.ajax({
	  url: baseUrl+port+"submit",
	  method: "POST",
	  data: form
	});
	
	request.done(function( msg ) {
	  console.log(msg);
	  clearHistoryRows();
	  for(var i=0; i<msg.length; i++){
	  	addHistoryRow(msg[i]);
	  }
	  $("#user").val(msg[0].name.S);
	});
	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log( "Request failed: " + textStatus );
	});
}

function getHistory(name){
	var request = $.ajax({
	  url: baseUrl+port+"history",
	  method: "POST",
	  data: {"name":name}
	});
	
	request.done(function( msg ) {
	  console.log(msg);
	  clearHistoryRows();
	  for(var i=0; i<msg.length; i++){
	  	addHistoryRow(msg[i]);
	  }
	  $("#user").val(msg[0].name.S);
	});
	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log( "Request failed: " + textStatus );
	});
}

function setupDatePickers(){
	var nowTemp = new Date();
	var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	 
	var checkin = $('#arrival').datepicker({
	}).on('changeDate', function(ev) {
	    var newDate = new Date(ev.date);
	    newDate.setDate(newDate.getDate() + 1);
	    checkout.setValue(newDate);
	  checkin.hide();
	  $('#departure')[0].focus();
	}).data('datepicker');
	var checkout = $('#departure').datepicker({
	  onRender: function(date) {
	    return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
	  }
	}).on('changeDate', function(ev) {
	  checkout.hide();
	}).data('datepicker');

}

function addHistoryRow(json){
	var arrival = new Date(parseInt(json.arrival.N));
	var departure = new Date(parseInt(json.departure.N));
	
	var row = '<li class="list-group-item flex-container"><p>'+json.name.S+'</p><p>'+json.location.S+'</p><p>Arrival: '+
	(arrival.getMonth() + 1) + '/' + arrival.getDate() + '/' +  arrival.getFullYear()+'</p><p>Departure: '+
	(departure.getMonth() + 1) + '/' + departure.getDate() + '/' +  departure.getFullYear()+'</p></li>';
	
	$(".content .list-group").append(row);
}

function clearHistoryRows(){
	$(".content .list-group").html("");
}
