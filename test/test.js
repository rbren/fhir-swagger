var fs = require('fs');
var expect = require('chai').expect;
var convert = require('../index.js');
var options = {
  fhir_url: 'http://argonaut.healthintersections.com.au/open',
  conformance_path: '/metadata?_format=application/json',
}

var GOLDEN_DIR = __dirname + '/out';

describe('Converter', function() {
  it('should create swagger', function(done) {
    this.timeout(4000);
    convert(options, function(err, swagger) {
      var goldenFile = GOLDEN_DIR + '/swagger.json';
      if (process.env.WRITE_GOLDEN) {
        fs.writeFileSync(goldenFile, JSON.stringify(swagger, null, 2));
      } else {
        var golden = require(goldenFile);
        expect(swagger).to.deep.equal(golden);
      }
      done();
    })
  })
})
