//function DefaultArgumentBinder(name, options, request) {
//    var result = request.query[name];
//    //console.log(name, options, request.query[name], new (options.type)(request.query[name]));
//    return result;
//}

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

$data.Class.define("$data.JSObjectAdapter", null, null, {
    constructor: function (type, instanceFactory) {
        var url = require('url');
        var q = require('q');
        var route = {};
        if (type.memberDefinitions) {
            var memDefs = type.memberDefinitions.getPublicMappedProperties().concat(type.memberDefinitions.getPublicMappedMethods());
            for (var i = 0; i < memDefs.length; i++) {
                var m = memDefs[i];
                route[m.method && m.method.hasOwnProperty('serviceName') ? m.method.serviceName || m.name : m.name] = m.name;
            }
        } else {
            route = type;
        }

        this.type = type;
        this.route = route;
        this.instanceFactory = instanceFactory;
        this.urlHelper = url;
        this.promiseHelper = q;

        this.defaultResponseLimit = 100;
    },

    handleRequest: function (req, res, next) {
        var self = this;

        var serviceInstance = this.instanceFactory(req, res);

        var _v;
        var memberName = this.resolveMemberName(req, serviceInstance);
        if (memberName) {

            var member = this.resolveMember(req, memberName);
            var oDataBuilderCfg;
            if (member) {

                var memberInfo = this.createMemberContext(member, serviceInstance);
                var methodArgs = this.resolveArguments(req, serviceInstance, memberInfo);

                if (memberInfo.method instanceof Array ? memberInfo.method.indexOf(req.method) >= 0 : memberInfo.method === req.method){
		            //this will be something much more dynamic
                    _v = memberInfo.invoke(methodArgs, req, res);

		            oDataBuilderCfg = {
		                version: 'V2',
		                baseUrl: req.fullRoute,
		                context: self.type,
		                methodConfig: member,
		                methodName: memberName,
		                request: req,
		                response: res
		            };
		        }else{
		            throw 'Invoke Error: Illegal method.';
		        }
            } else {
                if (memberName.indexOf('(') >= 0) memberName = memberName.split('(')[0];
                member = this.resolveEntitySet(req, memberName, serviceInstance);
                if (member) {
                    var esProc = new $data.JayService.OData.EntitySetProcessor(memberName, serviceInstance, { top: serviceInstance.storageProvider.providerConfiguration.responseLimit || self.defaultResponseLimit });

                    oDataBuilderCfg = {
		                version: 'V2',
		                baseUrl: req.fullRoute,
		                request: req,
		                response: res
		            };

                    if (esProc.isSupported(req)) {
                        _v = esProc.invoke(oDataBuilderCfg, req, res);
                    } else {
                        //404
                    }
                }
            }
        } else {
            _v = this.promiseHelper.fcall(function () {
                var serviceDef = new $data.JayStorm.ServiceDefinitionXml();
                return new $data.XmlResult(serviceDef.convertToResponse(serviceInstance, req.fullRoute));
            });
        }

        this.promiseHelper.when(_v).fail(function (err) {
            next(err);
        }).then(function (value) {
            if (!(value instanceof $data.ServiceResult)) {
                if (member.hasOwnProperty('resultType')){
                    if (typeof member.resultType === 'string') member.resultType = Container.resolveType(member.resultType);
                    value = new member.resultType(value, member.resultCfg || oDataBuilderCfg);
                } else {
                    value = new $data.oDataResult(value, oDataBuilderCfg);
                }
            }

            if (!(value instanceof $data.EmptyServiceResult)) {
                var resultText = value.toString();
                res.setHeader('Content-Length', new Buffer(resultText, 'utf8').length);
                res.setHeader('content-type', (res.getHeader('content-type') || value.contentType || 'text/plain') + ';charset=utf8');
                res.end(resultText);
            } else {
                res.end();
            }
        }).fail(function (err) {
            next(err);
        });
    },

    resolveMemberName: function (request, serviceInstance) {
        var parsedUrl = this.urlHelper.parse(request.url);
        //there will always be a leading '/'
        var pathElements = parsedUrl.pathname.split('/').slice(1);
        return pathElements[0];
    },

    resolveMember: function (request, memberName) {
        var prefixedMemberName = request.method + "_" + memberName;
        if (prefixedMemberName in this.route) {
            return this.type.prototype[this.route[prefixedMemberName]];
        } else {
            return this.type.prototype[this.route[memberName]];
        }
    },

    resolveEntitySet: function (request, memberName, serviceInstance) {
        return serviceInstance[this.route[memberName]];
    },
    createMemberContext: function (member, serviceInstance) {
        var self = this;

        var memberContext = {
            method: ['GET', 'POST']
        };
        for (var i in member) {
            if (member.hasOwnProperty(i)) {
                memberContext[i] = member[i];
            }
        }

        var params = memberContext.params;
        if (!params && typeof member === 'function' && member.length) {
            var paramsMatch = member.toString().match(/^function.*\(\s*(.*)\s*\)/);
            var paramsString;
            if (paramsMatch && typeof paramsMatch[1] === 'string') paramsString = paramsMatch[1].replace(/ /gi, '');
            params = paramsString.split(',');
            if (member.prototype.params) member.params(params);
            else member.params = params;
        }

        if (params) {
            memberContext.paramBinders = [];
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                memberContext.paramBinders.push($data.JayService.ArgumentBinder.defaultBinder.curry(null, param.name || param, { type: param.type ? Container.resolveType(param.type) : undefined }));
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

            var executionContext = request.executionContext || {
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
            //this.executionContext = executionContext;

            if (typeof serviceInstance.onReady === 'function') {
                serviceInstance.onReady(function () {
                    var result = member.apply(serviceInstance, args);

                    if (typeof result === 'function') {
                        result.call(executionContext);
                    } else if (self.promiseHelper.isPromise(result)) {
                        self.promiseHelper.when(result).then(function () {
                            defer.resolve(result.valueOf());
                        });
                    } else {
                        defer.resolve(result);
                    }
                });
            } else {
                var result = member.apply(serviceInstance, args);

                if (typeof result === 'function') {
                    result.call(executionContext);
                } else if (self.promiseHelper.isPromise(result)) {
                    return result;
                } else {
                    return self.promiseHelper.fcall(function () {
                        return result;
                    });
                }
            }

            return defer.promise;
        }

        return memberContext;
    },
    resolveArguments: function (request, serviceInstance, memberContext) {
        if (!memberContext.paramBinders) return;

        var paramBinders = memberContext.paramBinders;
        var paramValues = [];
        for (var i = 0; i < paramBinders.length; i++) {
            var binder = paramBinders[i];
            var result = binder(request);
            paramValues.push(result);
        }

        return paramValues;
    }
}, null);
