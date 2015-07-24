var Converter = module.exports = {};

var URL = require('url');

Converter.convert = function(baseURL, conf) {
  var swagger = {swagger: '2.0'};
  swagger.definitions = {};
  swagger.paths = {};
  swagger.info = {};
  swagger.info.title = conf.id;
  var url = URL.parse(baseURL);
  swagger.host = url.host;
  swagger.schemes = [url.protocol.substring(0, url.protocol.length - 1)];
  swagger.basePath = url.pathname;
  var resources = conf.rest[0].resource;
  console.log('resources', conf.rest.length, resources.length);
  return swagger;
}
