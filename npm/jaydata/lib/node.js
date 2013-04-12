$data = {};

try{
    $data.Acorn = require('acorn');
}catch(e){
    try{
        $data.Esprima = require('esprima');
    }catch(e){}
}

try{
    $data.mongoDBDriver = require('mongodb');
}catch(e){}

(function(global){
    if (typeof window === "undefined") {
        window = this;
    }
})(this);

try{
    sqLiteModule = require('sqlite3');
    if (sqLiteModule) window['openDatabase'] = true;
}catch(e){}

try{
    window.XMLHttpRequest = require('./JayService/Scripts/XMLHttpRequest-patched.js').XMLHttpRequest;
    
    if ($ && JQuery){
        $.support.cors = true;
        $.ajaxSettings.xhr = function(){
            return new XMLHttpRequest;
        };
    }
}catch(e){}

try{
    window.DOMParser = require("xmldom").DOMParser;
}catch(e){}
