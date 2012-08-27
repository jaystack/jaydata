require('./jaysus.js');
$data.MetadataLoader.load('http://services.odata.org/Northwind/Northwind.svc', function(result) {
    console.log(result);
});


//var fs = require('fs');
//fs.readFile('JayDataContextGenerator_OData.xslt.template','UTF-8', function() {
//    var xsl = arguments[1];
//    //xsl = xsl.replace('%%EDM_NAMESPACE', schemaNS);
//    //var result = xslt.transform(xsl, doc, ['SerivceUri', "'" + serviceUri + "'"]);
//    console.log(xsl);
////            fs.readFile('./' + transformer, 'UTF-8', function() {
////               var xslt = require('node_xslt');
////            });
//});

//var fs = require('fs');
//fs.readFile('JayDataContextGenerator_OData.xslt.template', 'UTF-8', function() {
//   console.dir(arguments);
//    var r = fs.readFileSync('JayDataContextGenerator_OData.xslt.template','UTF-8');
//});
//require('datajs');
//var $data = require('jaydata');
//require('./northwind.js');

//var xslt = require('node_xslt');
//
//var d = xslt.readXmlFile('./xml.xml');
//var s = xslt.readXsltFile('./xslt.xslt');
//var sss = 'abc';
//var result = xslt.transform(s,d, ['apple','aaa']);
//console.log(result);
//
//console.log(result);

//
//var xslt = require('node_xslt');
//
//var d = xslt.readXmlString('<xml></xml>')
//var ss = xslt.readXsltFile('./JayDataContextGenerator_OData_V2.xslt');
//var result = xslt.transform(ss, d,[]);
//console.log(result);