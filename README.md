# FHIR to Swagger
Generate Swagger from a FHIR conformance profile

## Usage
### Command Line
```bash
npm install -g fhir-swagger
fhir-swagger \
--fhir_url http://argonaut.healthintersections.com.au/open \
--conformance_path="/metadata?_format=application/json" \
--output swagger.json
```

### NodeJS
```bash
npm install --save fhir-swagger
```

```js
var fhirToSwagger = require('fhir-swagger')
var fhirURL = 'http://argonaut.healthintersections.com.au/open';
var conformancePath = '/metadata?_format=application/json';

fhirToSwagger(fhirURL, conformancePath, function(err, swagger) {
  console.log(swagger.info.title);
})
```
