<!DOCTYPE html>
<html>
	<head>
	<meta charset="utf-8">
	<title>QUnit Example</title>
		<script src="js/jquery-1.11.1.js"></script>
		<link rel="stylesheet" href="js/qunit-1.19.0.css">
		<script src="js/sinon-1.17.2.js"></script>
		<script src="js/qunit-1.19.0.js"></script>
		<script src="js/pubsub.js"></script>
	</head>
	<body>
		<div id="qunit"></div>
		<div id="qunit-fixture"></div>
		<script type="text/javascript">
		
			QUnit.log(function(obj){
				console.log("log",obj);
			});	
			
	   		function to_test() {
		      alert("I'm displaying an alert");
		      return 42;
		    }
	
			test("test",function(){
				var callback = sinon.spy();
			    PubSub.subscribe("message", callback);
	
			    PubSub.publishSync("message");
				
			    ok(callback.called);
			});
			
			test("ajax",function(){
				 sinon.spy(jQuery, "ajax");
				 
				 $.getJSON("/ajaxTest");
	
			        ok(jQuery.ajax.calledOnce);
			        equal("/ajaxTest", jQuery.ajax.getCall(0).args[0].url);
			        equal("json", jQuery.ajax.getCall(0).args[0].dataType);
			});
			
			test("alert TEST", function() {
				 var stub = sinon.stub(window, "alert", function(msg) { return true; } );
				 
				 equal(42, to_test(), "to_test() should return 42" );  
			     equal(1, stub.callCount, "to_test() should have invoked alert one time");
			     equal("I'm displaying an alert",stub.getCall(0).args[0], "to_test() should have displayed an alert" ); 
		    });
			
			test("비동기 테스트",function(){
				//http://api.wunderground.com/api/3c6e3d838e217361/geolookup/conditions/forecast/q/51.11999893,-114.01999664.json
				
				var result = null;
			
				 $.ajax({
					 url : "http://api.wunderground.com/api/3c6e3d838e217361/geolookup/conditions/forecast/q/51.11999893,-114.01999664.json",
					 dataType : "jsonp",
					 success : function(data){
						 result = data;
					 }
				 });
				 
				 setTimeout(function(){
						console.log("result",result);
						 equal(result.response.version,"0.1");
						 start();
				 },1000)
				
				stop();
			});
			test("동기 테스트",function(){
				//http://api.wunderground.com/api/3c6e3d838e217361/geolookup/conditions/forecast/q/51.11999893,-114.01999664.json
				
				var result = null;
			
				 $.ajax({
					 url : "http://api.wunderground.com/api/3c6e3d838e217361/geolookup/conditions/forecast/q/51.11999893,-114.01999664.json",
					 dataType : "jsonp",
					 async : false,
					 success : function(data){
						 result = data;
						console.log("result",result);
						start();
						equal(result.response.version,"0.1");
					 }
				 });
				stop();
				
			});
	
		    /* module("ajaxFacker",{
		    	setup : function(){
	    		  this.xhr = sinon.useFakeXMLHttpRequest();
	    	        var requests = this.requests = [];
	
	    	        this.xhr.onCreate = function (xhr) {
	    	            requests.push(xhr);
	    	        };
		    	},
		    	teardown : function(){
		    		  this.xhr.restore();
		    	}
		    })
		    
		    test("test should fetch comments from server",function(){
		    	 var callback = sinon.spy();
		         myLib.getCommentsFor("/ajaxTest", callback);
		         equal(1, this.requests.length);
	
		         this.requests[0].respond(200, { "Content-Type": "application/json" },
		                                  '[{ "id": 12, "comment": "Hey there" }]');
		         ok(callback.calledWith([{ id: 12, comment: "Hey there" }]));
		    }); */
		    
		    module("mock");
		    test("mockTest",function(){
		    	   var myAPI = { method: function () {} };
	
		    	    var spy = sinon.spy();
		    	    var mock = sinon.mock(myAPI);
		    	    mock.expects("method").once();
	
		    	    PubSub.subscribe("message", myAPI.method);
		    	    PubSub.subscribe("message", spy);
		    	    PubSub.publishSync("message", undefined);
	
		    	    mock.verify();
		    	    ok(spy.calledOnce);
		    });
					
		</script>
	</body>
</html>