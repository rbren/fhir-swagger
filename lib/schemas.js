'use strict';

var generateSchema = require('json-schema-generator');
var fs = require('fs');
var args = require('yargs').argv;
var version = 'dstu2';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const blacklist=[
	"text",
	"fhirVersion",
	"id",
	"version",
	"url",
	"contact",
	"baseDefinition",
	"publisher",
	"copyright",
	"derivation",
	// "differential",
	"mapping"
];

if (args.r4)
	version = "r4"
else if (args.dstu3)
	version = "dstu3"

var fixSchema = function (schema) {
	if (!schema) return schema;
	if (schema.required && !schema.required.length) delete schema.required;
	if (schema.properties) {
		for (let key in schema.properties) fixSchema(schema.properties[key]);
	}
	if (schema.items) {
		fixSchema(schema.items);
	}
	return schema;
}
var getSchema = module.exports = function (res,path=false) {
	if (res.type === 'Documentation' ||
		res.type === 'Remittance' ||
		res.type === 'User' ||
		res.type === 'Test' ||
		res.type === 'SupportingDocumentation') {
		return {};
	}
	let filename="";
	console.log(path)
	if(!path){
		filename = __dirname + '/../schemas/' + version + '/examples/' + res.type.toLowerCase();
		if (res.type === 'Medication') {
			filename += '-example-f002-crestor.json';
		} else if (res.type === 'MedicationAdministration' ||
			res.type === 'MedicationOrder' ||
			res.type === 'MedicationStatement' ||
			res.type === 'MedicationDispense' ||
			res.type === 'MedicationRequest') {
			filename += 'example1.json';
		} else if (res.type === 'NutritionOrder') {
			filename += '-example-cardiacdiet.json';
		} else if (res.type === 'Patient') {
			filename += '-example-a.json';
		} else if (res.type === 'RelatedPerson') {
			filename += '-example-peter.json';
		} else if (res.type === 'BodyStructure') {
			filename += '-example-fetus.json';
		} else {
			filename += '-example.json';
		}
	}else{
		filename = path + '/' + res.type;
		// console.log(filename)
	}
	console.log(filename)
	let example;
	try {
		if(path){
			console.log("looking for json")
			example = JSON.parse(fs.readFileSync(filename+".json"));
		}else{
			example = JSON.parse(fs.readFileSync(filename));
		}
	} catch (e) {
		console.log('Failed to find schema example for ' + res.type);
		console.log(e.message)
		return {};
	}
	blacklist.forEach(x=>{
		if(example[x]){
			delete example[x];
		}
	})
	let schema = generateSchema(example);
	delete schema.$schema;
	// delete schema.text;
	return fixSchema(schema);
}

var mergeSchema = function(schema,definition){

}

