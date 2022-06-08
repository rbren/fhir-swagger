var Converter = require('./lib/conformance-to-swagger.js');
const xml2js= require("xml2js")
var FS = require('fs');

module.exports = function(options, callback) {
    // console.log(options)
    var body = FS.readFileSync(options.fhir_cs_path, "utf-8");
    if(options.fhir_cs_path.endsWith('.xml')){
        xml2js.parseString(body,(err,json)=>{
            if(err){
                throw err;
            }
            Converter.convert(options.fhir_url, json.CapabilityStatement,options).then(swagger=>{
                callback(null,swagger);
            });
        });
    }else{
        var json = JSON.parse(body);
        Converter.convert(options.fhir_url, json,options).then(swagger=>{
            callback(null,swagger);
        });
    }
   
    // return callback(null, swagger);
}
