#!/usr/bin/node

var handlebars = require('handlebars');
var fs = require('fs');

require('./z.js');

fs.readFile('nginx-host.conf', 'utf8', function(err, contents) {
	var template = handlebars.compile(contents);
	console.log(template(z));
});

