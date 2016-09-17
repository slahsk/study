define(['handlebars'], function(Handlebars) {
return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\r\n		<form action=\"/users/save\" method=\"post\">\r\n			<label for=\"name\">ID</label>\r\n			<input type=\"text\" id=\"id\" name=\"id\">\r\n			<label for=\"name\">NAME</label>\r\n			<input type=\"text\" id=\"name\" name=\"name\">\r\n			<label for=\"pass\">GENDER</label>\r\n			<input type=\"text\" id=\"gender\" name=\"gender\">\r\n			<label for=\"pass\">PASS</label>\r\n			<input type=\"password\" id=\"pass\" name=\"pass\">\r\n			<input type=\"submit\" value=\"login\">\r\n		</form>\r\n";
  })
});