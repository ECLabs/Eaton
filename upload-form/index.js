/*
function login() {
		    var user = prompt("Enter email address");

		    if (user != null) {
		         var pass = prompt("Enter password");
		    }
		    else {
		         alert("Please enter email address to log in");
		    }
		};
*/

function handleFileSelect(evt) {
		    var files = evt.target.files; // FileList object

		    // files is a FileList of File objects. List some properties.
		    var output = [];
		    for (var i = 0, f; f = files[i]; i++) {
		      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
		                  f.size, ' bytes, last modified: ',
		                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
		                  '</li>');
		    }
		    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
};
document.getElementById('files').addEventListener('change', handleFileSelect, false);

$(document).ready(function(){
    $("#description").hide();
 
    $(".btn2").click(function(){
        $("p").show();
  
});


function submit(){
		
};