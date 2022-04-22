# FHIR to Swagger
Generate Swagger from a FHIR conformance profile

## Usage
### Command Line
Install:
```bash
npm install -g fhir-swagger
```

Generate Swagger DSTU3:
```bash
fhir-swagger \
--fhir_cs_path "/path/to/metadata.json"
--schemaPath "/path/to/profileSchemas"
--fhir_url "http://fhirtest.uhn.ca/baseDstu3" \
--conformance_path="/metadata?_format=application/json" \
--dstu3 \
--output swagger.json
```

Generate Swagger R4:
```bash
fhir-swagger \
--fhir_url "http://<your_base>/app/FHIR/r4" \
--conformance_path="/metadata?_format=application/json" \
--r4 \
--output swagger.json
```

### NodeJS
Install:
```bash
npm install --save fhir-swagger
```

Use in code:
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

### Docker
#### Build
```bash
docker build -t <your username>/fhir-swagger .
```

#### Run
```bash
docker run --network host <your username>/fhir-swagger --fhir_url "http://<your_base>/app/FHIR/r4" --conformance_path="/metadata?_format=application/json" --r4 
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

