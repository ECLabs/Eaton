$(document).ready(function(){
	$("#submit-button").on('click', function(){
		submit();
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
	  //TODO add a list of results
	  console.log(msg);
	});
	 
	request.fail(function( jqXHR, textStatus ) {
	  alert( "Request failed: " + textStatus );
	});
}

function setupDatePickers(){
	var nowTemp = new Date();
	var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	 
	var checkin = $('#arrival').datepicker({
	  // onRender: function(date) {
	    // return date.valueOf() < now.valueOf() ? 'disabled' : '';
	  // }
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
