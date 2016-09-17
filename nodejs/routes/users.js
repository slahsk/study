var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get("/signup",function(req, res){
	res.render('users/signup');
});



router.post("/save",function(req, res){
	
	req.getConnection(function(err, connection){
		var query = connection.query("INSERT INTO user SET ?",req.body,function(err, result){
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
