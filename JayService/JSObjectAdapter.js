function DefaultArgumentBinder(name, options, request){
    var result = request.query[name];
    console.log(name, options, request.query[name], new (options.type)(request.query[name]));
    return result;
}

Function.prototype.curry = function () {
    var self = this;
    var args = arguments;
    return function () {
        var _args = Array.prototype.slice.call(args, 1);
        var _args2 = Array.prototype.slice.call(arguments);
        args = _args.concat(_args2);
        return self.apply(null, args);
    }
};

﻿(function ($data, q) {

    $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
        constructor: function () {
            this.deferred = new q.defer();
        },
        deferred: {},
        createCallback: function (callBack) {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            var self = this;

            return cbWrapper = {
                success: function () {
                    callBack.success.apply(this, arguments);
                    self.deferred.resolve.apply(this, arguments);
                },
                error: function () {
                    callBack.error.apply(this, arguments);
                    self.deferred.reject.apply(this, arguments);
                }
            };
        },
        getPromise: function () {
            return this.deferred.promise;
        }
    }, null);

    $data.PromiseHandler = $data.Deferred;

})($data, require('q'));

$data.Class.define("$data.JSObjectAdapter", null, null, {
    constructor:function (type, instanceFactory) {
        var url = require('url');
        var q = require('q');
        var route = {};
        if (type.memberDefinitions){
            var memDefs = type.memberDefinitions.getPublicMappedProperties().concat(type.memberDefinitions.getPublicMappedMethods());
            for (var i = 0; i < memDefs.length; i++){
                var m = memDefs[i];
                route[m.method && m.method.hasOwnProperty('serviceName') ? m.method.serviceName || m.name : m.name] = m.name;
            }
        }else{
            route = type;
        }
        
        Object.defineProperty(this, "type", { value:type, enumerable:true, writable:false, configurable:false });
        Object.defineProperty(this, "route", { value:route, enumerable:true, writable:false, configurable:false });
        Object.defineProperty(this, "instanceFactory", { value:instanceFactory, enumerable:true, writable:false, configurable:false });
        Object.defineProperty(this, 'urlHelper', {value: url, enumerable:true, writable:false, configurable:false});
        Object.defineProperty(this, 'promiseHelper', {value: q, enumerable:true, writable:false, configurable:false});
    },
    handleRequest:function (req, res, next) {
        var self = this;
        
        var serviceInstance = this.instanceFactory();

        var memberName = this.resolveMemberName(req, serviceInstance);
        var member = this.resolveMember(req, memberName);
        var _v;
        var oDataBuidlerCfg;
        if (member){
            var memberInfo = this.createMemberContext(member, serviceInstance);
            var methodArgs = this.resolveArguments(req, serviceInstance, memberInfo);

            //this will be something much more dynamic
            _v = memberInfo.invoke(methodArgs, req, res);
            
            oDataBuidlerCfg = {
                version: 'V2',
                baseUrl: 'http://localhost:3000/contextapi.svc',
                context: self.type,
                methodConfig: member,
                methodName: memberName
            };
        }else{
            if (memberName.indexOf('(') >= 0) memberName = memberName.split('(')[0];
            member = this.resolveEntitySet(req, memberName, serviceInstance);
            if (member){
                var pHandler = new $data.PromiseHandler();
                var cbWrapper = pHandler.createCallback();

                //try {
                    var builder = new $data.oDataParser.ODataEntityExpressionBuilder(serviceInstance, memberName);
                    var result = builder.parse({
                        count: false,
                        filter: req.query.$filter || '',
                        orderby: req.query.$orderby || '',
                        select: req.query.$select || '',
                        skip: req.query.$skip || '',
                        top: req.query.$top || '',
                        expand: req.query.$expand || ''
                    });
                    
                    serviceInstance.executeQuery(new $data.Queryable(member, result.expression), cbWrapper);
                /*} catch (e) {
                    cbWrapper.error(e);
                }*/

                _v = pHandler.getPromise();
                
                oDataBuidlerCfg = {
                    version: 'V2',
                    baseUrl: 'http://localhost:3000/contextapi.svc',
                    context: self.type,
                    countRequest: false,
                    collectionName: memberName,
                    selectedFields: result.selectedFields,
                    includes: result.includes
                };
            }
        }

        this.promiseHelper.when(_v).then(function (value){
            if (!(value instanceof $data.ServiceResult)){
                if (typeof member === 'object'){
                    if (member.hasOwnProperty('resultType') && member.resultType instanceof $data.ServiceResult){
                        value = new member.resultType(value, member.resultCfg);
                    }else{
                        value = new $data.oDataJSONResult(value, oDataBuidlerCfg);
                    }
                }else{
                    value = typeof value === 'object' ? new $data.JSONResult(value) : new $data.ServiceResult(value);
                }
            }

            res.setHeader('Content-Type', value.contentType || 'text/plain');
            res.end(value.toString());
        }).fail(function(err){
            res.end(err.toString());
        });
    },

    resolveMemberName:function (request, serviceInstance) {
        var parsedUrl = this.urlHelper.parse(request.url);
        //there will always be a leading '/'
        var pathElements = parsedUrl.pathname.split('/').slice(1);
        return pathElements[0];
    },
    resolveMember:function (request, memberName) {
        var prefixedMemberName = request.method + "_" + memberName;
        if (prefixedMemberName in this.route) {
            return this.type.prototype[this.route[prefixedMemberName]];
        } else {
            return this.type.prototype[this.route[memberName]];
        }
    },
    resolveEntitySet: function(request, memberName, serviceInstance){
        return serviceInstance[this.route[memberName]];
    },
    createMemberContext:function (member, serviceInstance) {
        var self = this;

        var memberContext = {
            method: 'GET'
        };
        for (var i in member){
            if (member.hasOwnProperty(i)){
                memberContext[i] = member[i];
            }
        }

        var params = memberContext.params;
        if (!params && typeof member === 'function' && member.length){
            var paramsMatch = member.toString().match(/^function.*\(\s*(.*)\s*\)/);
            var paramsString;
            if (paramsMatch && typeof paramsMatch[1] === 'string') paramsString = paramsMatch[1].replace(/ /gi, '');
            params = paramsString.split(',');
            if (member.prototype.params) member.params(params);
            else member.params = params;
        }
        
        if (params){
            memberContext.paramBinders = [];
            for (var i = 0; i < params.length; i++){
                var param = params[i];
                memberContext.paramBinders.push(DefaultArgumentBinder.curry(null, param.name || param, { type: param.type ? Container.resolveType(param.type) : undefined }));
            }
        }

        memberContext.invoke = function (args, request, response) {
            var defer = self.promiseHelper.defer();

            function success(r) {
                defer.resolve(r);
            }

            function error(r) {
                defer.reject(r);
            }
            
            var executionContext = {
                request: request,
                response: response,
                context: serviceInstance,
                success: success,
                error: error
            };

            Object.defineProperty(serviceInstance, "executionContext", {
                value:executionContext,
                enumerable:false,
                writable:false,
                configurable:false
            });
            
            var result = member.apply(executionContext, args);

            if (typeof result === 'function'){
                result.call(executionContext);
            }else if (self.promiseHelper.isPromise(result)){
                return result;
            }else{
                return self.promiseHelper.fcall(function () {
                    return result;
                });
            }
            
            return defer.promise;
        }

        return memberContext;
    },
    resolveArguments:function (request, serviceInstance, memberContext){
        if (!memberContext.paramBinders) return;
        
        var paramBinders = memberContext.paramBinders;
        var paramValues = [];
        for (var i = 0; i < paramBinders.length; i++){
            var binder = paramBinders[i];
            var result = binder(request);
            paramValues.push(result);
        }
        
        return paramValues;
    }
}, null);
