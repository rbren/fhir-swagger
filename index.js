var Converter = require('./lib/conformance-to-swagger.js');
var FS = require('fs');

module.exports = function(options, callback) {
    var body = FS.readFileSync(options.fhir_cs_path, "utf-8");
    var json = JSON.parse(body);
    var swagger = Converter.convert(options.fhir_url, json);
    return callback(null, swagger);
}
