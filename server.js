var App = require('express')();

var Request = require('request');
var Convert = require('./index.js');
var LucyConsole = require('lucy-console');

var args = require('./options.js')
var swagger = null;
Swagger = Convert(args, function(err, s) {
  if (err) throw err;
  swagger = s;
  var portal = new LucyConsole({
    swagger: swagger,
  })
  App.use(portal.router);
});

App.get('/swagger', function(req, res) {
  res.json(swagger);
})

App.listen(3000);
