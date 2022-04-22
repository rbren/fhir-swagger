'use strict';

const converter = require('./converter')
var generateSchema = require('json-schema-generator');
var fs = require('fs');
var args = require('yargs').argv;
var version = 'dstu2';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();


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
	if(!path){
		filename = __dirname + '/../schemas/' + version + '/examples/' + res.type.toLowerCase()+".profile.json";
		// if (res.type === 'Medication') {
		// 	filename += '-example-f002-crestor.json';
		// } else if (res.type === 'MedicationAdministration' ||
		// 	res.type === 'MedicationOrder' ||
		// 	res.type === 'MedicationStatement' ||
		// 	res.type === 'MedicationDispense' ||
		// 	res.type === 'MedicationRequest') {
		// 	filename += '.profile.json';
		// } else if (res.type === 'NutritionOrder') {
		// 	filename += '.profile.json';
		// } else if (res.type === 'Patient') {
		// 	filename += '.profile.json';
		// } else if (res.type === 'RelatedPerson') {
		// 	filename += '.profile.json';
		// } else if (res.type === 'BodyStructure') {
		// 	filename += '-.profile.json';
		// } else {
		// 	filename += '.profile.json';
		// }
	}else{
		filename = path + '/' + res.type+".profile.json";
		// console.log(filename)
	}
	// console.log(filename)
	let profile;
	try {
		if(path){
			// console.log("looking for json")
			profile = JSON.parse(fs.readFileSync(filename.toLowerCase()));
		}else{
			profile = JSON.parse(fs.readFileSync(filename.toLowerCase()));
		}
	} catch (e) {
		console.log('Failed to find schema profile for ' + res.type);
		console.log(e.message)
		return {};
	}
	// blacklist.forEach(x=>{
	// 	if(example[x]){
	// 		delete example[x];
	// 	}
	// })
	// let schema = generateSchema(example);
	console.log("converting",profile.id)
	let schema = converter.convert(profile,profile.type);
	// delete schema.$schema;
	// delete schema.text;
	return (schema);
}