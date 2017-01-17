var mysql = require('mysql');

var client = mysql.createConnection({
	user : 'root',
	password : 'tiger',
	database : 'nodejs',
	host : '192.168.0.8',
	port:'3306'
});

client.query("select * from user",function(error, result, fields){
	console.log(result);
});

client.query("insert into user (name, age, gender) values(?,?,?)",["aaa",1,"M"],function(error, result, fields){
	console.log(result);
});

client.query("select * from user",function(error, result, fields){
	console.log(result);
});

//client.query("update user set ? where no = ?" ,[{age:20},4],function(error, result, fields){
//	console.log(result);
//});

//client.query("delete from user where ?" ,{no:3},function(error, result, fields){
//	console.log(result);
//});

client.end();