var args = require('yargs').argv;
args = module.exports = JSON.parse(JSON.stringify(args));
args.fhir_url = args.fhir_url || 'http://argonaut.healthintersections.com.au/open';
args.conformance_path = args.conformance_path || '/metadata?_format=application/json';
args.output = args.output || '-';
if (args.username) {
  args.authorization = {
    username: args.username,
    password: args.password,
  }
}
if (args.reject_unauthorized === 'false' || args.reject_unauthorized === '0') {
  args.reject_unauthorized = false;
}

