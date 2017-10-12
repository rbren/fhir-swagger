# FHIR to Swagger
Generate Swagger from a FHIR conformance profile

## Usage
### Command Line
```bash
npm install -g fhir-swagger
fhir-swagger \
--fhir_url "http://fhirtest.uhn.ca/baseDstu3" \
--conformance_path="/metadata?_format=application/json" \
--dstu3 \
--output swagger.json
```

### NodeJS
```bash
npm install --save fhir-swagger
```

```js
var fhirToSwagger = require('fhir-swagger')
var options = {
  fhir_url: 'http://fhirtest.uhn.ca/baseDstu3',
  conformance_path: '/metadata?_format=application/json',
}

fhirToSwagger(options, function(err, swagger) {
  console.log(swagger.info.title);
})
```

## All Options

These options can be passed in to the NodeJS function or the command line.

* fhir_url: The base URL of the FHIR server
* conformance_path: The path where the conformance profile can be found
* reject_unauthorized: Ignore SSL certificate errors if set to false

### Authorization

You can use the --username and --password options on the command line, or pass in an `auth` object in NodeJS
to perform basic authorization when accessing the conformance profile:

```js
fhirToSwagger({
  auth: {username: 'foo', password: 'bar'}
}, function(err, swagger) {

})
```

