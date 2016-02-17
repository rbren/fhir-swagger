var FS = require('fs');
var getSchema = require('./schemas.js');

var Converter = module.exports = {};

var DESCRIPTION = FS.readFileSync(__dirname + '/../data/description.md', 'utf8')

var URL = require('url');

var INTERACTIONS = {
  instance: ['read', 'vread', 'update', 'delete', 'history'],
  type: ['create', 'search-type', 'history-type', 'history-instance'],
}
INTERACTIONS.all = INTERACTIONS.instance.concat(INTERACTIONS.type);
var DEFAULT_INTERACTIONS = INTERACTIONS.all.map(function(i) {return {code: i}})

var getDefaultOp = function(res) {
  return {
    tags: [res.type],
    parameters: [],
    responses: {'200': {description: "Success"}}
  }
}

Converter.convert = function(baseURL, conf) {
  var swagger = {swagger: '2.0'};
  swagger.definitions = {};
  swagger.paths = {};
  swagger.info = {description: DESCRIPTION, title: conf.id};
  var url = URL.parse(baseURL);
  swagger.host = url.host;
  swagger.schemes = [url.protocol.substring(0, url.protocol.length - 1)];
  swagger.basePath = url.pathname;
  var resources = conf.rest[0].resource;
  swagger.tags = resources.map(function(res) {
    return {name: res.type};
  })

  resources.forEach(function(res) {
    if (!res.searchParam) return;
    var schema = swagger.definitions[res.type] = getSchema(res);
    var schemaRef = '#/definitions/' + res.type;
    var typeOps = swagger.paths['/' + res.type] = {};
    var instOps = swagger.paths['/' + res.type + '/{id}'] = {parameters: [{in: 'path', name: 'id', type: 'string'}]}
    res.interaction = res.interaction || DEFAULT_INTERACTIONS;
    var interactions = res.interaction.map(s => s.code);
    if (interactions.indexOf('create') !== -1) {
      typeOps.post = getDefaultOp(res);
      typeOps.post.parameters.push({
        name: 'body',
        in: 'body',
        schema: {$ref: schemaRef},
      })
    }
    if (interactions.indexOf('search-type') !== -1) {
      typeOps.get = getDefaultOp(res);
      typeOps.get.parameters = res.searchParam.map(function(param) {
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
      typeOps.get.parameters.push(formatParam);
      typeOps.get.responses['200'].schema = {type: 'array', items: {$ref: schemaRef}}
    };
    if (interactions.indexOf('history-instance') !== -1) {
      var histOp
          = swagger.paths['/' + res.type + '/{id}/_history']
          = {get: getDefaultOp(res)}
      histOp = histOp.get;
      histOp.parameters = [
        {name: 'id', in: 'path', type: 'string'},
        {name: '_count', in: 'query', type: 'string'},
        {name: '_since', in: 'query', type: 'string'},
      ]
    }
    if (interactions.indexOf('history-type') !== -1) {
      var histOp
          = swagger.paths['/' + res.type + '/_history']
          = {get: getDefaultOp(res)}
      histOp = histOp.get;
      histOp.parameters = [
        {name: 'id', in: 'path', type: 'string'},
        {name: '_count', in: 'query', type: 'string'},
        {name: '_since', in: 'query', type: 'string'},
      ]
    }

    if (interactions.indexOf('read') !== -1) {
      instOps.get = getDefaultOp(res);
      instOps.get.responses['200'].schema = {$ref: schemaRef};
    }
    if (interactions.indexOf('vread') !== -1) {
      var versionOp = swagger.paths['/' + res.type + '/{id}/_history/{vid}'] = {get: getDefaultOp(res)};
      versionOp = versionOp.get;
      versionOp.parameters = [
        {name: 'id', in: 'path', type: 'string'},
        {name: 'vid', in: 'path', type: 'string'},
      ];
      versionOp.responses['200'].schema = {$ref: schemaRef};
    }
    if (interactions.indexOf('update') !== -1) {
      instOps.put = getDefaultOp(res);
      instOps.put.parameters.push({
        in: 'body',
        name: 'body',
        schema: {$ref: schemaRef}
      })
    }
    if (interactions.indexOf('delete') !== -1) {
      instOps.delete = getDefaultOp(res);
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
