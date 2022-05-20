var FS = require('fs');
var getSchema = require('./schemas.js');
const getDefaultSchemes = require('./converter').getDefault
// const defaultSchemes=require("../data/defaultSchemes.json");

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

Converter.convert = async function(baseURL, conf,options) {
  var swagger = {openapi: '3.0.0'};
  var definitions = {};
  swagger.paths = {};
  swagger.info = {description: DESCRIPTION, title: conf.id?conf.id:conf.description?conf.description.split("/")[0]:"" || 'Untitled', version: 'unspecified'};
  var url = URL.parse(baseURL);
  swagger.servers = [
    {
      url: url.href,
      description: "staging"
    }
  ];
  swagger.components = {
    schemas: definitions
  }

  var resources = conf.rest[0].resource;
  swagger.tags = resources.map(function(res) {
    return {name: res.type};
  })

  resources.forEach(function(res) {    
    var schema = definitions[res.type] = getSchema(res,options.schemaPath,options);
    var schemaRef = '#/components/schemas/' + res.type;
    var typeOps = swagger.paths['/' + res.type] = {};
    var instOps = swagger.paths['/' + res.type + '/{id}'] = {parameters: [{in: 'path', required: true, name: 'id', schema: {type: 'string'}}]}
    res.interaction = res.interaction || DEFAULT_INTERACTIONS;
    var interactions = res.interaction.map(s => s.code);
    if (interactions.indexOf('create') !== -1) {
      typeOps.post = getDefaultOp(res);
      typeOps.post.requestBody = {
        content: {
          "application/json": {
            schema: {
              $ref: schemaRef
            },
          }
        },
        required: true
      }
    }
    if (interactions.indexOf('search-type') !== -1 && res.searchParam) {
      typeOps.get = getDefaultOp(res);
      typeOps.get.parameters = res.searchParam.map(function(param) {
        var swagParam = {
          name: param.name,
          schema: {type: convertType(param.type)},
          in: 'query',
          description: param.documentation
        }
        var format = getFormat(param.type);
        if (format) swagParam.schema.format = format;
        return swagParam;
      });
      var formatParam = {
        name: '_format',
        in: 'query',
        schema: {
          type: 'string'
        },
      }
      formatParam['x-consoleDefault'] = 'application/json';
      typeOps.get.parameters = typeOps.get.parameters.filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i);
      typeOps.get.parameters.push(formatParam);
      typeOps.get.responses['200'].content = {'*/*': {schema: {type: 'array', items: {$ref: schemaRef}}}}
    }
    if (interactions.indexOf('history-instance') !== -1) {
      var histOp
          = swagger.paths['/' + res.type + '/{id}/_history']
          = {get: getDefaultOp(res)}
      histOp = histOp.get;
      histOp.parameters = [
        {name: 'id', in: 'path', required: true, schema: {type: 'string'}},
        {name: '_count', in: 'query', schema: {type: 'string'}},
        {name: '_since', in: 'query', schema: {type: 'string'}},
      ]
    }
    if (interactions.indexOf('history-type') !== -1) {
      var histOp
          = swagger.paths['/' + res.type + '/_history']
          = {get: getDefaultOp(res)}
      histOp = histOp.get;
      histOp.parameters = [
        {name: '_count', in: 'query', schema: {type: 'string'}},
        {name: '_since', in: 'query', schema: {type: 'string'}},
      ]
    }

    if (interactions.indexOf('read') !== -1) {
      instOps.get = getDefaultOp(res);
      instOps.get.responses['200'].content = {'*/*': {schema: {$ref: schemaRef}}};
    }
    if (interactions.indexOf('vread') !== -1) {
      var versionOp = swagger.paths['/' + res.type + '/{id}/_history/{vid}'] = {get: getDefaultOp(res)};
      versionOp = versionOp.get;
      versionOp.parameters = [
        {name: 'id', in: 'path', required: true, schema: {type: 'string'}},
        {name: 'vid', in: 'path', required: true, schema: {type: 'string'}},
      ];
      versionOp.responses['200'].content = {'*/*': {schema: {$ref: schemaRef}}};
    }
    if (interactions.indexOf('update') !== -1) {
      instOps.put = getDefaultOp(res);
      instOps.put.requestBody = {
        content: {
          "application/json": {
            schema: {
              $ref: schemaRef
            },
          }
        },
        required: true
      }
    }
    if (interactions.indexOf('delete') !== -1) {
      instOps.delete = getDefaultOp(res);
    }
  });
  let defaultSchemes=await getDefaultSchemes(conf.version)
  definitions=Object.assign(definitions, defaultSchemes.definitions);
  return swagger;
}

const SWAGGER_TYPES = ['integer', 'number', 'string', 'boolean', 'array', 'object'];

var convertType = function(type) {
  if (SWAGGER_TYPES.indexOf(type) !== -1) return type;
  if (type === 'quantity') return 'integer';
  return 'string';
}

var getFormat = function(type) {
  if (type === 'date') return 'date';
}
