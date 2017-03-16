var Conference = Conference || {};
var Aop = require('./Aop.js');

Conference.memoizedRestaurantApi = function(thiredPartyApi){
  'use strict'

  var api = thiredPartyApi,
      cache = {};

  return {
    getRestaurantsNearConference : function(cuisine){
      if(cache.hasOwnProperty(cuisine)){
        return cache[cuisine];
      }

      var returnedPromises = api.getRestaurantsNearConference(cuisine);
      cache[cuisine] = returnedPromises;

      return returnedPromises;
    }
  };
};

exports.Conference = Conference;


exports.ThirdParty = {
  restaurantApi : function(){

    return {
      getRestaurantsNearConference : function(){

      }
    }
  }
};

exports.Aspects = {
  returnValueCache : function(){
    var cache = {};

    return {
      advice : function(targetInfo){
        var cacheKey = JSON.stringify(targetInfo.args);

        if(cache.hasOwnProperty(cacheKey)){
          return cache[cacheKey];
        }

        var returnValue = Aop.next(targetInfo);
        cache[cacheKey] = returnValue;

        return returnValue;
      }
    };
  }
};
