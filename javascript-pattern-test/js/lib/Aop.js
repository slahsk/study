exports.around =  function(fnName, advice, fnObj){
  var originalFn = fnObj[fnName];

  fnObj[fnName] = function(){

    return advice.call(this,{fn:originalFn,args:arguments});
  };

};

exports.next = function(targetInfo){
  return targetInfo.fn.apply(this,targetInfo.args)
};
