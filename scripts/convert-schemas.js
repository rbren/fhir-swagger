#!/usr/bin/env node

var Path = require('path');
var FS = require('fs');
var Async = require('async');
var Convert = require('xsd2json');

var INPUT_DIR = Path.join(__dirname, '..', 'schemas/xsd');
var OUTPUT_DIR = Path.join(__dirname, '..', 'schemas/json');
var xsdFilenames = FS.readdirSync(INPUT_DIR);

var xsdFiles = xsdFilenames.map(function(f) {
  return Path.join(INPUT_DIR, f);
})

console.log('files',xsdFiles[0])
//Convert(xsdFiles[0]).pipe(process.stdout);
Async.map(xsdFiles, Convert, function(err, jsonSchemas) {
  if (err) throw err;
  jsonSchemas.forEach(function(schema, index) {
    var filename = xsdFiles[index];
    filename = filename.substring(0, filename.length - 4) + '.json';
    filename = Path.join(OUTPUT_DIR, filename);
    FS.writeFileSync(filename, schema);
  })
})
