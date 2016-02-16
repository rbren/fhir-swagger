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

  resources.forEach(function(res) {
    if (!res.searchParam) return;
    var path = swagger.paths['/' + res.type] = {};
    res.interaction = res.interaction || [{code: 'read'}];
    var interactions = res.interaction.map(s => s.code);
    if (interactions.indexOf('read') !== -1) {
      path.get = {};
      path.get.parameters = res.searchParam.map(function(param) {
        var swagParam = {
          name: param.name,
          type: convertType(param.type),
          in: 'query',
          description: param.documentation
        }
        var format = getFormat(param.type);
        if (format) swagParam.format = format;
        return swagParam;
      });
      var formatParam = {
        name: '_format',
        in: 'query',
        type: 'string',
      }
      formatParam['x-consoleDefault'] = 'application/json';
      path.get.parameters.push(formatParam);
      path.get.responses = {'200': {description: 'Success'}}
    };
  });
  return swagger;
}

var convertType = function(type) {
  if (type === 'token') return 'string';
  if (type === 'date') return 'string';
  if (type === 'quantity' || type === 'number') return 'integer';
  return type;
}

var getFormat = function(type) {
  if (type === 'date') return 'date';
}
