	
	function testFn(a){
		return a*a;
	}
	function testFn2(a){
		return a*a;
	}
	function testFn3(){
	}
	
	module("spy")
	
	test("spyTest1",function(){
	    var spy = sinon.spy(window, "testFn2");
	    
	    equal(testFn2(5),25);
	    ok(spy.calledOnce);
		
	});
	
	
	module("stub")
	
	test("stubTest1",function(){
		var stub = sinon.stub();
		stub.withArgs(5).returns(25);
		stub.withArgs(10).returns(100);
		
		equal(stub(5),25);
	});
	
	test("stubTest2",function(){
		var stub = sinon.stub(window,"testFn");
		stub.withArgs(1).returns(10);
		stub.withArgs(10).returns(100);
		
		equal(testFn(1),10);
	});
	
	module("mock")
	test("mockTest1",function(){
		 var mock = sinon.mock(window);
		 mock.expects("testFn3").once().withExactArgs("Hello World");
		 
		 testFn3("Hello World");
		 
		 ok(mock.verify());
		 mock.restore()
	});
	
	
	module("ajaxFackerServer")
	test("ajaxTest",function(){
		var server = sinon.fakeServer.create();

		server.respondWith("GET", "/twitter/api/user.json", [
		    200, 
		    {"Content-Type": "application/json"}, 
		    '[{"id": 0, "tweet": "Hello World"}]'
		]);

		$.get("/twitter/api/user.json", function (data) {
		    equal(data[0].id,"0");  
		});
		
		server.respond();
		server.restore();
	});