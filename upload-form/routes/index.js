var express = require('express');
var router = express.Router();
var multer = require('multer');
var done = false;

router.use(multer({ dest: './uploads/',
	rename: function (fieldname, filename) {
		return filename + Date.now();
	},
	onFileUploadStart: function (file) {
		console.log(file.originalname + ' is starting ...')
	},
	onFileUploadComplete: function(file) {
		console.log(file.fieldname + ' uploaded to ' + file.path)
		done = true;
	}
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload Form' });
});

router.post('/file-upload', function(req, res){
	if(done == true){
		console.log(req.files);
		res.end("File uploaded.");
	}
});

module.exports = router;
