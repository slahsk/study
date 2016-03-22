angular.module("myapp.testFilter",[]).provider("myfilter",function(){
	this.$get = function(){
		return {
			test :1
		};
	};
});