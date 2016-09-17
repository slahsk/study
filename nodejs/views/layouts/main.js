define(['handlebars'], function(Handlebars) {
return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<!DOCTYPE html>\r\n<html>\r\n<head>\r\n	<meta charset=\"utf-8\">\r\n	<title>layouts</title>\r\n	<script src=\"https://code.jquery.com/jquery-1.10.2.js\"></script>\r\n</head>\r\n	<body>\r\n		";
  if (stack1 = helpers.body) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.body; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n	</body>\r\n</html>";
  return buffer;
  })
});