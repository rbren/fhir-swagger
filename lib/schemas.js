'use strict';

const converter = require('./converter')
var fs = require('fs');
var args = require('yargs').argv;
var version = 'dstu2';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

var getSchema = module.exports = function (res,path=false,options) {
	if (res.type === 'Documentation' ||
		res.type === 'Remittance' ||
		res.type === 'User' ||
		res.type === 'Test' ||
		res.type === 'SupportingDocumentation') {
		return {};
	}
	let filename = path + '/'+options.prefix + res.type+".profile.json";
	let profile;
	try {
		profile = JSON.parse(fs.readFileSync(filename.toLowerCase()));
	} catch (e) {
		try{
			let filename = path + '/'+options.prefix + res.type+".structuredefinition.json";
			profile = JSON.parse(fs.readFileSync(filename.toLowerCase()));
		}
		catch (e){
			console.log('Failed to find schema profile for ' + res.type);
			// console.log(e.message)
			return {};
		}
	}
	console.log("converting",res.type)
	let schema = converter.convert(profile,profile.type);
	return (schema);
}