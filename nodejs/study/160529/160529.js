
	exports.ev = (function(){
			var ev = new process.EventEmitter();
			
			
			ev.on("1",function(){
				console.log(1);
				console.log(2);
				console.log(3);
			});
			
			ev.on("2",function(){
				console.log("khj");
			});
			
			return ev;
		
	}());