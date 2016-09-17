define(['handlebars'], function(Handlebars) {
return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n	<form action=\"/login/submit\" method=\"post\">\r\n		<label for=\"name\">ID</label>\r\n		<input type=\"text\" id=\"name\" name=\"name\">\r\n		<label for=\"pw\">PW</label>\r\n		<input type=\"password\" id=\"pw\" name=\"pw\">\r\n		<input type=\"submit\" value=\"login\">\r\n	</form>\r\n";
  })
});