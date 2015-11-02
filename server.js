var App = require('express')();

var Request = require('request');
var Converter = require('./lib/conformance-to-swagger.js');

var BASE_URL = 'http://argonaut.healthintersections.com.au/open';
var CONF_PATH = '/metadata?_format=application/json';

var Swagger = {};

Request(BASE_URL + CONF_PATH, {json: true}, function(err, resp, body) {
  if (err) throw err;
  Swagger = Converter.convert(BASE_URL, body);
})

App.get('/swagger', function(req, res) {
  res.json(Swagger);
})

App.listen(3000);
