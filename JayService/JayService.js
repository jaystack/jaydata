var serviceFunc = require("./ServiceFunction.js");


exports.serviceFunctionPrototype = serviceFunc.serviceFunctionPrototype;
exports.serviceFunction = serviceFunc.serviceFunction;


var q = require('q');
var url = require('url');
var $data = require('jaydata');

require('./EntityTransform.js');
require('./oDataResponseDataBuilder.js');


function XmlResult(data) {
    this.data = data;
    this.toString = function() {
        return data;
    }
}

function asXml(data) {
    return new XmlResult(data);
}

exports.serviceResult = {
    asXml: asXml
};

//function ArrayType(elementType) {
//    this.elementType = elementType;
//}






//function NoopFormat(data) {
//    return data;
//}
//
//var responseFormatters = {
//    'application/json': function(data) { return JSON.stringify(data); },
//    'text/plain': NoopFormat,
//    'text/xml': NoopFormat
//};

require("./ServiceBase.js");
var JSObjectAdapter = require("./JsObjectAdapter.js");



exports.ServiceBase = $data.ServiceBase;
exports.createAdapter = function(type, instanceFactory) {
    return function(req, res, next) {
        var adapter = new JSObjectAdapter(type, instanceFactory);
        adapter.handleRequest(req, res, next);
    }
}