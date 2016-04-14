$(document).ready(function(){
	$("#submit-button").on('click', function(){
		submit();
	});
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
