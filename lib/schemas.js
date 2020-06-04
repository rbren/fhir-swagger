'use strict';

var generateSchema = require('json-schema-generator');
var fs = require('fs');
var args = require('yargs').argv;
var version = 'dstu2';

if (args.r4)
  version = "r4"
else if (args.dstu3)
  version = "dstu3"

var fixSchema = function(schema) {
  if (!schema) return schema;
  if (schema.required && !schema.required.length) delete schema.required;
  if (schema.properties) {
    for (let key in schema.properties) fixSchema(schema.properties[key]);
  }
  if (schema.items) {
    fixSchema(schema.items);
  }
  return schema;
}

var getSchema = module.exports = function(res) {
  if (res.type === 'Documentation' ||
      res.type === 'Remittance' ||
      res.type === 'User' ||
      res.type === 'Test' ||
      res.type === 'SupportingDocumentation') {
    return {};
  }
  var filename = __dirname + '/../schemas/' + version + '/examples/' + res.type.toLowerCase();
  if (res.type === 'Medication') {
    filename += '-example-f002-crestor.json';
  } else if (res.type === 'MedicationAdministration' ||
             res.type === 'MedicationOrder' ||
             res.type === 'MedicationStatement' ||
             res.type === 'MedicationDispense' ||
             res.type === 'MedicationRequest' ) {
    filename += 'example1.json';
  } else if (res.type === 'NutritionOrder') {
    filename += '-example-cardiacdiet.json';
  } else if (res.type === 'Patient') {
    filename += '-example-a.json';
  } else if (res.type === 'RelatedPerson') {
    filename += '-example-peter.json';
  } else if (res.type === 'BodyStructure') {
    filename += '-example-fetus.json';
  } else {
    filename += '-example.json';
  }
  var example = null;
  try {
    example = JSON.parse(fs.readFileSync(filename));
  } catch (e) {
    console.log('Failed to find schema example for ' + res.type);
    return {};
  }
  let schema = generateSchema(example);
  delete schema.$schema;
  return fixSchema(schema);
}

