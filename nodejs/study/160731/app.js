var http = require('http');
var express = require('express');
var logger = require("morgan");
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');


var app = express();
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.set('view engine','jade');
app.set('views', __dirname);
app.use(express.static('public'));
app.use(logger('combined', {stream: accessLogStream}));

app.use(bodyParser.urlencoded({extended : false}));
app.use(function(req, res, next){
	console.log(req.path);
	next();
});

/*app.get("/:name",function(req, res){
	res.send("Hello World " + req.params.name);
});*/

app.get("/",function(req, res){
	res.send("Hello World");
});

app.get('/form',function(req, res){
	res.render('form');
});

app.post("/form/submit",function(req, res){
	res.send("name :" + req.body.name +"title :"+req.body.title);
});

http.createServer(app).listen(80, function(){
	console.log('Server run');
});