'use strict';

var Conference = require('../lib/8.js').Conference;
var ThirdParty = require('../lib/8.js').ThirdParty;
var Aspects = require('../lib/8.js').Aspects;
//
var Aop = require('../lib/Aop.js');


describe('memoizedRestaurantsApi',function(){


  var api,
      service,
      returnedFromService;

  beforeEach(function(){
    api = ThirdParty.restaurantApi();
    service = Conference.memoizedRestaurantApi(api);
    returnedFromService = {};
  });

  describe('getRestaurantsNearConference(cuisine)',function(){
    it('기대 인자를 넘겨 api의 getRestaurantsNearConference를 실행',function(){
      var cuisine = '분식';
      spyOn(api,'getRestaurantsNearConference');
      service.getRestaurantsNearConference(cuisine);

      var args = api.getRestaurantsNearConference.calls.argsFor(0);
      expect(args[0]).toEqual(cuisine);

    });

    it('서드파티 API의 반환값을 반환한다.', function(){
      spyOn(api,'getRestaurantsNearConference').and.returnValue(returnedFromService);
      var  value = service.getRestaurantsNearConference('Asian Fusion');

      expect(value).toBe(returnedFromService);

    });

    it('같은 요리를 여러 번 요청해도 api는 한 번만 요청한다',function(){
      var cuisine = '분식';


      spyOn(api,'getRestaurantsNearConference').and.returnValue(returnedFromService);

      var iterations = 5;

      for(var i = 0; i < iterations; i++){
        var value = service.getRestaurantsNearConference(cuisine);
      }

      expect(api.getRestaurantsNearConference.calls.count()).toBe(1);

    });

    it('같은 요리를 여러 번 요청해도 같은 값으로 귀결한다.',function(){
      var cuisine = '한정식';


      spyOn(api,'getRestaurantsNearConference').and.returnValue(returnedFromService);

      var iterations = 5;

      for(var i = 0; i < iterations; i++){
        var value = service.getRestaurantsNearConference(cuisine);
        expect(value).toBe(returnedFromService);
      }
    });
  });
});

describe('returnValueCache',function(){
  var testObject,
      testValue,
      args,
      spyReference,
      testFunctionExcutionCount;

  beforeEach(function(){
    testFunctionExcutionCount = 0;
    testValue = {};
    testObject = {
      testFunction : function(arg){
        return testValue;
      }
    };

    spyOn(testObject, 'testFunction').and.callThrough();
    spyReference = testObject.testFunction;

    Aop.around('testFunction', Aspects.returnValueCache().advice, testObject);

    args = [{key:'value'},'someValue'];
  });

  describe('advice(targetInfo)',function(){
    it('첫 번째 실행 시 작성괸 함수의 반환값을 반환하다.', function(){
      var value = testObject.testFunction.apply(testObject, args);
      expect(value).toBe(testValue);
    });


    it('여러 번 실행 시 장식된 함수의 반환값을 반환한다.', function(){
      var iterations = 3;

      for(var i = 0; i < iterations; i++){
        var value = testObject.testFunction.apply(testObject, args);
        expect(value).toBe(testValue);
      }
    });
  });

    it('같은 키값으로 여러 번 실행해도 장신된 함수만 실행한다.', function(){
      var iterations = 3;

      for(var i = 0; i < iterations; i++){
        var value = testObject.testFunction.apply(testObject,args);
        expect(value).toBe(testObject);
      }

      expect(spyReference.calls.count()).tbBe(1);
    });
    
    it('고유한 각 키값마다 꼭 한 번씩 장식된 함수를 실행한다.', function(){
      var keyValues = ['value1','value2','valeu3'];

      keyValues.forEach(function(arg){
        var value = testObject.testFunction(arg);
      });

      keyValues.forEach(function(arg){
        var value = testObject.testFunction(arg);
      });

      expect(spyReference.calls.count()).toBe(keyValues.length);

    });




});
