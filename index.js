var Converter = require('./lib/conformance-to-swagger.js');
var FS = require('fs');

module.exports = function(options, callback) {
    // console.log(options)
    var body = FS.readFileSync(options.fhir_cs_path, "utf-8");
    var json = JSON.parse(body);
    Converter.convert(options.fhir_url, json,options).then(swagger=>{
        callback(null,swagger);
    });
    // return callback(null, swagger);
}
