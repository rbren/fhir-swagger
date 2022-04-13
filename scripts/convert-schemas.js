#!/usr/bin/env node

let Path = require('path');
let FS = require('fs');
let Async = require('async');
// let Convert = require('xsd2json');
const xml2js = require('xml2js');

let INPUT_DIR = Path.join(__dirname, '..', 'schemas/xsd');
let OUTPUT_DIR = Path.join(__dirname, '..', 'schemas/json');
let xsdFilenames = FS.readdirSync(INPUT_DIR);

let xsdFiles = xsdFilenames.map(function(f) {
  return Path.join(INPUT_DIR, f);
})

console.log('files',xsdFiles[0])
//Convert(xsdFiles[0]).pipe(process.stdout);
let parser = new xml2js.Parser();
try {
  xsdFiles.forEach((x,index)=>{
    FS.readFile(x, function(err, data) {
      if (err) throw err;
      console.log(data)
      parser.parseString(data, function (err, result) {
        if (err) throw err;
        let filename = xsdFiles[index];
        filename = filename.substring(0, filename.length - 4) + '.json';
        filename = Path.join(OUTPUT_DIR, filename);
        FS.writeFileSync(filename, result);
      });
  });
  })
} catch (error) {
  console.error(error);
}

// Async.map(xsdFiles, Convert, function(err, jsonSchemas) {
  
//   jsonSchemas.forEach(function(schema, index) {
//     let filename = xsdFiles[index];
//     filename = filename.substring(0, filename.length - 4) + '.json';
//     filename = Path.join(OUTPUT_DIR, filename);
//     FS.writeFileSync(filename, schema);
//   })
// })
