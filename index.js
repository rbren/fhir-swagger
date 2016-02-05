var FS = require('fs');
var Request = require('request');
var Converter = require('./lib/conformance-to-swagger.js');

var args = require('yargs').argv

var baseURL = args.fhir_url || 'http://argonaut.healthintersections.com.au/open';
var confPath = args.conformance_path || '/metadata?_format=application/json';
var outputFile = args.output || './swagger.json';

Request(baseURL + confPath, {json: true}, function(err, resp, body) {
  if (err) throw err;
  var swagger = Converter.convert(baseURL, body);
  FS.writeFileSync(outputFile, JSON.stringify(swagger, null, 2))
})
