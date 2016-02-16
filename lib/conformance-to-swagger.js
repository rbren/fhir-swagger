var Converter = module.exports = {};

var URL = require('url');

var INTERACTIONS = {
  instance: ['read', 'vread', 'update', 'delete', 'history'],
  type: ['create', 'search', 'history'],
}
INTERACTIONS.all = INTERACTIONS.instance.concat(INTERACTIONS.type);
var DEFAULT_INTERACTIONS = INTERACTIONS.all.map(function(i) {return {code: i}})

var getDefaultOp = function() {
  return {
    parameters: [],
    responses: {'200': {description: "Success"}}
  }
}

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
    var typeOp = swagger.paths['/' + res.type] = {};
    var instOp = swagger.paths['/' + res.type + '/{id}'] = {parameters: [{in: 'path', name: 'id', type: 'string'}]}
    res.interaction = res.interaction || DEFAULT_INTERACTIONS;
    var interactions = res.interaction.map(s => s.code);
    if (interactions.indexOf('create') !== -1) {
      typeOp.post = getDefaultOp();
    }
    if (interactions.indexOf('search') !== -1) {
      typeOp.get = getDefaultOp();
      typeOp.get.parameters = res.searchParam.map(function(param) {
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
      typeOp.get.parameters.push(formatParam);
    };
    if (interactions.indexOf('history') !== -1) {
      var histOp
          = swagger.paths['/' + res.type + '/{id}/_history']
          = swagger.paths['/' + res.type + '/{id}/_history']
          = {get: getDefaultOp()}
      histOp = histOp.get;
      histOp.parameters = [
        {name: 'id', in: 'path', type: 'string'},
        {name: '_count', in: 'query', type: 'string'},
        {name: '_since', in: 'query', type: 'string'},
      ]
    }
    if (interactions.indexOf('read') !== -1) {
      instOp.get = getDefaultOp();
    }
    if (interactions.indexOf('vread') !== -1) {
      var versionOp = swagger.paths['/' + res.type + '/{id}/_history/{vid}'] = {get: getDefaultOp()};
      versionOp = versionOp.get;
      versionOp.parameters = [
        {name: 'id', in: 'path', type: 'string'},
        {name: 'vid', in: 'path', type: 'string'},
      ];
    }
    if (interactions.indexOf('update') !== -1) {
      instOp.put = getDefaultOp();
    }
    if (interactions.indexOf('delete') !== -1) {
      instOp.delete = getDefaultOp();
    }
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
