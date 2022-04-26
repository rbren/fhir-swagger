var Converter = require('./lib/conformance-to-swagger.js');
var FS = require('fs');

module.exports = function(options, callback) {
    options=formatOptions(options);
    var body = FS.readFileSync(options.fhir_cs_path, "utf-8");
    var json = JSON.parse(body);
    var swagger = Converter.convert(options.fhir_url, json,options);
    return callback(null, swagger);
}

function formatOptions(args){
    
    args = module.exports = JSON.parse(JSON.stringify(args));
    args.fhir_url = args.fhir_url || 'http://argonaut.healthintersections.com.au/open';
    args.conformance_path = args.conformance_path || '/metadata?_format=application/json';
    args.output = args.output || '-';
    args.fhir_cs_path=(/[A-z]:\//.test(args.fhir_cs_path))?args.fhir_cs_path:process.cwd()+args.fhir_cs_path;
    args.schemaPath=(/[A-z]:\//.test(args.schemaPath))?args.schemaPath:process.cwd()+args.schemaPath;
    return args;
}
