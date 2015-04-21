function toggle(switchElement) {
var general = document.getElementById('general');
var genDisplaySetting = general.style.display;
/*general.style.visibility = 'visibile';*/

var recruiter = document.getElementById('description');
var recDisplaySetting = recruiter.style.display;
/*recruiter.style.visibility = 'hidden';*/

var jobseeker = document.getElementById('resume');
var jobDisplaySetting = jobseeker.style.display;
/*jobseeker.style.visibility = 'hidden';*/


/*function toggle(switchElement) {*/
	if (switchElement.value == 'recruiter') {
		general.style.display = 'none';
		recruiter.style.display = 'block';
		jobseeker.style.display = 'none';
	}
	else if (switchElement.value =='jobseeker') {
		general.style.display = 'none';
		recruiter.style.display = 'none';
		jobseeker.style.display = 'block';
	}
};

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
document.getElementById('files').addEventListener('change', handleFileSelect, false);