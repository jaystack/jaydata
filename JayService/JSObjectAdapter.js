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
        ///	<signature>
        ///     <summary>Express and Connect middleware for handle webrequests</summary>
        ///     <description>Express and Connect middleware for handle webrequests</description>
        ///     <param name="type" type="function">Service class type</param>
        ///     <param name="instanceFactory" type="function">Service class instance factory</param>
        ///     <return type="function" />
        ///	</signature>

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
    },
    
    processRequest: function(req, res, next, serviceInstance, self){
        var _v, member;
        var memberName = self.resolveMemberName(req, serviceInstance);
        if (memberName) {
            member = self.resolveMember(req, memberName);
            var oDataBuilderCfg;
            if (member) {

                var memberInfo = self.createMemberContext(member, serviceInstance);
                var methodArgs = self.resolveArguments(req, serviceInstance, memberInfo);

                if (memberInfo.method instanceof Array ? memberInfo.method.indexOf(req.method) >= 0 : memberInfo.method === req.method){
                    oDataBuilderCfg = {
	                    version: 'V2',
	                    baseUrl: req.fullRoute,
	                    context: self.type,
	                    methodConfig: member,
	                    methodName: memberName,
	                    request: req,
	                    response: res
	                };
	                
	                //this will be something much more dynamic
                    _v = memberInfo.invoke(methodArgs, req, res, oDataBuilderCfg);
	            }else{
	                throw 'Invoke Error: Illegal method.';
	            }
            } else {
                if (memberName.indexOf('(') >= 0) memberName = memberName.split('(')[0];
                member = self.resolveEntitySet(req, memberName, serviceInstance);
                if (member) {
                    var esProc = new $data.JayService.OData.EntitySetProcessor(memberName, serviceInstance, { top: serviceInstance.storageProvider.providerConfiguration.responseLimit || $data.JayService.OData.Defaults.defaultResponseLimit });

                    oDataBuilderCfg = {
	                    version: 'V2',
	                    baseUrl: req.fullRoute,
	                    request: req,
	                    response: res
	                };

                    if (esProc.isSupported(req)) {
                        _v = esProc.invoke(oDataBuilderCfg, req, res);
                    } else {
                        //405
                        _v = self.promiseHelper.fcall(function () { return new $data.EmptyServiceResult(404); });
                    }
                } else {
                    //404
                    _v = self.promiseHelper.fcall(function () { return new $data.EmptyServiceResult(404); });
                }
            }
        } else {
            _v = self.promiseHelper.fcall(function () {
                if (req.method === 'GET') {
                    var serviceDef = new $data.oDataServer.ServiceDefinitionXml();
                    return new $data.XmlResult(serviceDef.convertToResponse(serviceInstance, req.fullRoute));
                } else {
                    return new $data.EmptyServiceResult(405);
                }
            });
        }

        self.promiseHelper.when(_v)
        .then(function (value) {
            if (res._header || res._headerSent) return;
            
            if (!(value instanceof $data.ServiceResult)) {
                if (member.hasOwnProperty('resultType')){
                    if (typeof member.resultType === 'string') member.resultType = Container.resolveType(member.resultType);
                    value = new member.resultType(value, member.resultCfg || oDataBuilderCfg);
                } else {
                    value = new $data.oDataResult(value, oDataBuilderCfg);
                }
            }
            
            res.statusCode = value.statusCode !== 200 ? value.statusCode : res.statusCode;
            var resultText;
            if (!(value instanceof $data.EmptyServiceResult) && (resultText = value.toString())) {
                res.setHeader('Content-Length', new Buffer(resultText, 'utf8').length);
                var contentType = (res.getHeader('content-type') || value.contentType || 'text/plain') + ';charset=UTF-8';
                res.setHeader('content-type',
                    (contentType.indexOf('application/json;odata=verbose') >= 0
                        ? 'application/json;charset=utf-8;' + contentType.replace('application/json;', '').replace('charset=utf-8;', '')
                        : contentType)
                );
                res.end(resultText);
            } else {
                res.setHeader('Content-Length', 0);
                res.end();
            }
        }).fail(function (err) {
            if (err === 'Authorization failed') {
                res.statusCode = 401;
            }
            next(err);
        });
    },

    handleRequest: function (req, res, next) {
        ///	<signature>
        ///     <summary>request handler middleware for webrequests</summary>
        ///     <description>Prepare execution context and invoke the called Service method or standard OData endpoint</description>
        ///	</signature>

        var self = this;

        var serviceInstance = this.instanceFactory(req, res);
        if (serviceInstance && serviceInstance.onReady === 'function'){
            serviceInstance.onReady(function(){
                self.processRequest(req, res, next, serviceInstance, self);
            }).fail(function(err){
                next(err);
            });
        }else{
            if (serviceInstance && self.promiseHelper.isPromise(serviceInstance.onReady)){
                self.promiseHelper.when(serviceInstance.onReady).then(function(){
                    self.processRequest(req, res, next, serviceInstance, self);
                }).fail(function(err){
                    next(err);
                });
            }else{
                try{
                    self.processRequest(req, res, next, serviceInstance, self);
                }catch(err){
                    next(err);
                }
            }
        }
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
                memberContext.paramBinders.push($data.ArgumentBinder.defaultBinder.curry(null, param.name || param, { type: param.type ? Container.resolveType(param.type) : undefined }));
            }
        }

        memberContext.invoke = function (args, request, response, oDataBuilderCfg) {
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
            
            var result = member.apply(serviceInstance, args);

            if (typeof result === 'function') {
                result.call(serviceInstance, success, error);
            } else if (self.promiseHelper.isPromise(result)) {
                self.promiseHelper.when(result).then(function () {
                    defer.resolve(result.valueOf());
                });
            } else if (result instanceof $data.Queryable) {
                var entitySet = serviceInstance._entitySetReferences[result.defaultType.name].name;
                var esProc = new $data.JayService.OData.EntitySetProcessor(entitySet, serviceInstance, { top: serviceInstance.storageProvider.providerConfiguration.responseLimit || $data.JayService.OData.Defaults.defaultResponseLimit });

                if (esProc.isSupported(request)) {
                    var builder = new $data.oDataParser.ODataEntityExpressionBuilder(serviceInstance, entitySet);
                    builder.createRootExpression = function () {
                        var preparator = Container.createQueryExpressionCreator(serviceInstance);
                        var expression = preparator.Visit(result.expression);
                        
                        var expr = expression;
                        while (expr){
                            if (expr.getType().fullName === $data.Expressions.EntitySetExpression.fullName) break;
                            expr = expr.source;
                        }
                        
                        this.lambdaTypes.push(expr || expression);
                        return expression;
                    };
                    builder.filterConverter = function (expr, rootExpr) {
                        var pqExp = this._buildParametricQueryExpression(expr, $data.Expressions.FilterExpression);
                        var expressionSource = rootExpr;
                        var expression = pqExp;
                        if (rootExpr instanceof $data.Expressions.FilterExpression) {
                            expressionSource = rootExpr.source;
                            var operatorResolution = serviceInstance.storageProvider.resolveBinaryOperator("and");
                            expression = Container.createSimpleBinaryExpression(rootExpr.selector, expression, "and", "filter", "boolean", operatorResolution);
                        }
                        return new $data.Expressions.FilterExpression(expressionSource, expression);
                    };
                    var frameType = $data.Expressions.ExpressionType.ToArray;

                    var idFilter = [];
                    if (esProc.member.idObject) {
                        var filter = [];
                        for (var name in esProc.member.idObject) {
                            idFilter.push(name + ' eq ' + esProc.member.idObject[name]);
                        }
                        frameType = $data.Expressions.ExpressionType.Single;
                        oDataBuilderCfg.singleResult = true;
                    }

                    if (oDataBuilderCfg.isCountResult === true)
                        frameType = $data.Expressions.ExpressionType.Count;

                    oDataBuilderCfg.simpleResult = oDataBuilderCfg.simpleResult || esProc.member.valueRequeset;

                    try {
                        var buildResult = builder.parse({
                            frame: frameType,
                            filter: idFilter.length > 0 ? idFilter.join(' and ') : (request.query.$filter || ''),
                            orderby: request.query.$orderby || '',
                            select: esProc.member.selectedField || request.query.$select || '',
                            skip: request.query.$skip || '',
                            top: request.query.$top || '',
                            expand: request.query.$expand || '',
                            inlinecount: request.query.$inlinecount || ''
                        });
                    }catch(err){
                        return defer.reject(new Error(err.message));
                    }

                    oDataBuilderCfg.collectionName = entitySet;
                    oDataBuilderCfg.selectedFields = buildResult.selectedFields;
                    oDataBuilderCfg.includes = buildResult.includes;
                    serviceInstance.executeQuery(new $data.Queryable(serviceInstance[entitySet], buildResult.expression), {
                        success: function (contextResult) {
                            if (esProc.member.valueRequeset) {
                                // request pattern: /EntitySet(key)/Field/$value
                                self.prepareSimpleResponse(contextResult, esProc.member.selectedField, serviceInstance[entitySet], callback);
                            } else if (oDataBuilderCfg.simpleResult) {
                                defer.resolve(new $data.ServiceResult(contextResult));
                            } else {
                                defer.resolve(contextResult);
                            }
                        },
                        error: function (err) {
                            defer.reject(err);
                        }
                    });
                } else {
                    //405
                    //_v = self.promiseHelper.fcall(function () { return new $data.EmptyServiceResult(404); });
                    defer.resolve(new $data.EmptyServiceResult(404));
                }
            } else {
                defer.resolve(result);
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
