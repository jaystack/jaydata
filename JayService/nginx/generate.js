#!/usr/bin/node

var handlebars = require('handlebars');
var fs = require('fs');

require('./z.js');

fs.readFile('nginx-host.conf', 'utf8', function(err, contents) {
  var template = handlebars.compile(contents);

handlebars.registerHelper("unique", function(array, fn, elseFn) {
  var ports = {};
  if (array && array.length > 0) {
    var buffer = "";
    for (var i = 0, j = array.length; i < j; i++) {
      var item = array[i];
      if (ports[item.port] == undefined) {
        ports[item.port] = true;
        buffer += fn.fn(item);
      }
    }
    return buffer;
  }
  else {
    return elseFn();
  }
});
console.log(template(z));
});

