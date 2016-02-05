var Request = require('request');
var Converter = require('./lib/conformance-to-swagger.js');

module.exports = function(baseURL, confPath, callback) {
  callback = callback || function(err) {if (err) throw err};
  Request(baseURL + confPath, {json: true}, function(err, resp, body) {
    if (err) return callback(err);
    var swagger = Converter.convert(baseURL, body);
    callback(null, swagger);
  })
}
