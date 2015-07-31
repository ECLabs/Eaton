function toggle(switchElement) {
		var general = document.getElementById('general');
		var genDisplaySetting = general.style.display;

		var recruiter = document.getElementById('description');
		var recDisplaySetting = recruiter.style.display;

		var jobseeker = document.getElementById('resume');
		var jobDisplaySetting = jobseeker.style.display;

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

	$(document).ready(function(){
		$('#uploadForm').submit(function(){
			
			$(this).ajaxSubmit({
				error: function(xhr){
					status('Error: ' + xhr.status);
					alert("File Upload Failed. Please Try Again");
				},
				success: function(response){
					console.log(response);
					alert("File Upload Successful");
				}
			});
			//disable page refresh
			return false;
		});
	});