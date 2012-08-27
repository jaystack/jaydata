#!/usr/bin/node

var os=require('os');
var ifaces=os.networkInterfaces();
var ip=ifaces['eth0'][0].address;

var Handlebars = require('handlebars');
var fs = require('fs');

require('./z.js');

fs.readFile('nginx-host.conf', 'utf8', function(err, contents) {
  var template = Handlebars.compile(contents);

Handlebars.registerHelper("unique", function(array, fn, elseFn) {
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
Handlebars.registerHelper('json', function(context) {
    return new Handlebars.SafeString(JSON.stringify(context));
});

z.ip=ip;
var limitedcors = true;
for (var x in z.application.firewall.outgress.allows) {
  var address = z.application.firewall.outgress.allows[x].address;
  if (address == "*") limitedcors = false;
}
z.limitedcors = limitedcors;
console.log(template(z));
});

