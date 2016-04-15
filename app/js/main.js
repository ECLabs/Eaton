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
});

function submit(){
	var form = {};
	form.name = $("#name").val();
	form.location = $("#location").val();
	form.arrival = $("#arrival").val();
	form.departure = $("#departure").val();
	var request = $.ajax({
	  url: "http://0.0.0.0:3000/submit",
	  method: "POST",
	  data: form
	});
	
	request.done(function( msg ) {
	  console.log(msg);
	  clearHistoryRows();
	  for(var i=0; i<msg.length; i++){
	  	addHistoryRow(msg[i]);
	  }
	});
	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log( "Request failed: " + textStatus );
	});
}

function getHistory(name){
	var request = $.ajax({
	  url: "http://0.0.0.0:3000/history",
	  method: "POST",
	  data: {"name":name}
	});
	
	request.done(function( msg ) {
	  console.log(msg);
	  clearHistoryRows();
	  for(var i=0; i<msg.length; i++){
	  	addHistoryRow(msg[i]);
	  }
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
	var row = '<li class="list-group-item flex-container"><p>'+json.name+'</p><p>'+json.location+'</p><p>'+json.arrival+'</p><p>'+json.departure+'</p></li>';
	$(".content .list-group").append(row);
}

function clearHistoryRows(){
	$(".content .list-group").html("");
}
