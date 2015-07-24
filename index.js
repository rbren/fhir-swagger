var Request = require('request');
var Converter = require('./lib/conformance-to-swagger.js');

var BASE_URL = 'http://argonaut.healthintersections.com.au/open';
var CONF_PATH = '/metadata?_format=application/json';

Request(BASE_URL + CONF_PATH, {json: true}, function(err, resp, body) {
  if (err) throw err;
  var swagger = Converter.convert(BASE_URL, body);
  console.log('swagger', swagger);
})
