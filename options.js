var args = require('yargs').argv;
args = module.exports = JSON.parse(JSON.stringify(args));
args.fhir_url = args.fhir_url || 'http://argonaut.healthintersections.com.au/open';
args.conformance_path = args.conformance_path || '/metadata?_format=application/json';
args.output = args.output || '-';
args.fhir_cs_path=(/[A-z]:\//.test(args.fhir_cs_path))?args.fhir_cs_path:process.cwd()+args.fhir_cs_path;
args.schemaPath=(/[A-z]:\//.test(args.schemaPath))?args.schemaPath:process.cwd()+args.schemaPath;
args.v=args.v||"R4"
// console.log(args)
// process.exit()