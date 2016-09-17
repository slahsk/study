var mysql = require('mysql');

var client = mysql.createPool({
	user : 'root',
	password : '1234',
	database : 'spring',
	host : 'localhost',
	port:'3306',
	connectionLimit : 20
});

client.getConnection(function(err, connection){
	
	var query = connection.query("select 1 from dual",function(err, data){
		console.log(data);
		connection.release();
	});
});

