var a = require("./160529");

a.ev.emit("1");
a.ev.emit("2");

var http = require("http");
var fs = require("fs");

var server = http.createServer(function(req,res){
	console.log("server");
	
	fs.readFile("C:/Users/Public/Pictures/Sample Picture/Penguins.jpg", function(error, data){
		res.writeHead(200,{'content-Type' : 'image/jpeg'});
		res.end(data);
	});
});

var hostname = "hahahaha";

server.listen("8080", function(){
});
