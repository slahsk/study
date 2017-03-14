var Conference = Conference || {};

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
