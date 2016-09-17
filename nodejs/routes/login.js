var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('login');
});

router.post("/submit",function(req, res){
	
	req.getConnection(function(err, connection){
		
		var query = connection.query("INSERT INTO BOOKING SET ?",req.body,function(err, data){
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
