var http = require('http');
var express = require('express');
var logger = require("morgan");

var app = express();

app.set('view engine','jade');
app.set('views', __dirname);

app.use(express.static('public'));
app.use(logger());

app.get('/jade',function(req, res){
	res.render('jadePage',{time:Date(), name:'YOYOYO'});
});


http.createServer(app).listen(80, function(){
	console.log('Server run');
});