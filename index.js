var Request = require('request');
var Converter = require('./lib/conformance-to-swagger.js');

module.exports = function(options, callback) {
  callback = callback || function(err) {if (err) throw err};
  var headers = {};
  var auth = options.authorization;
  if (auth) {
    var authString = auth.username + ':' + auth.password;
    authString = new Buffer(authString).toString('base64');
    headers.Authorization = 'Basic ' + authString;
  }

  Request({
    rejectUnauthorized: options.reject_unauthorized,
    url: options.fhir_url + options.conformance_path,
    headers: headers,
    json: true,
  }, function(err, resp, body) {
    if (err) return callback(err);
    var swagger = Converter.convert(options.fhir_url, body);
    if (auth) {
      swagger.securityDefinitions = swagger.securityDefinitions || {};
      swagger.securityDefinitions.Basic = {type: 'basic'};
    }
    callback(null, swagger);
  })
}
