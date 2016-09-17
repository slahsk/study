var express = require('express');
var router = express.Router();



router.get('/', function(req, res, next) {
	res.send('MOVIE');
});

router.get('/reserve', function(req, res, next) {
	res.render('movie/reserve');
});

router.post('/save',function(req, res){
req.getConnection(function(err, connection){
		console.log();
		var query = connection.query("INSERT INTO booking (seat,date) ?",req.body,function(err, data){
			console.log(query);
	        if (err) {
	            console.error(err);
	            throw err;
	        }
	        res.send(200,'success');
		});
	});
	
});

module.exports = router;
