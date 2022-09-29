var Converter = require('./lib/conformance-to-swagger.js');
const { XMLParser, }= require("fast-xml-parser")
var FS = require('fs');

module.exports = function(options, callback) {
    var body = FS.readFileSync(options.fhir_cs_path, "utf-8");
    if(options.fhir_cs_path.endsWith('.xml')){
        let xmlOptions = {
            ignoreAttributes: false,
            ignoreDeclaration: true,
            attributeNamePrefix: ""
        };
        const parser = new XMLParser(xmlOptions);
        let jsonObj = parser.parse(body);
        let json =recurse(jsonObj);
        // console.log(jsonObj)
        Converter.convert(options.fhir_url, json.CapabilityStatement,options).then(swagger=>{
            callback(null,swagger);
        });
    }else{
        var json = JSON.parse(body);
        Converter.convert(options.fhir_url, json,options).then(swagger=>{
            callback(null,swagger);
        });
    }
}
function recurse(obj) {     
    for ( var key in obj ) { // works for objects and arrays 
        var item = obj[key];
        if(item.value){
            obj[key]=item.value
        } 
        else if ( typeof item === "object" ) 
            obj[key]=recurse(item); 
    } 
    return obj;
  } 
