
function DefaultArgumentBinder(name, options, request) {
    var result = request.query[name];
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


$data.Class.define("$data.JSObjectAdapter", null, null, {
    constructor:function (type, instanceFactory) {
        var url = require('url');
        var q = require('q');
        Object.defineProperty(this, "type", { value:type, enumerable:true, writable:false, configurable:false });
        Object.defineProperty(this, "instanceFactory", { value:instanceFactory, enumerable:true, writable:false, configurable:false });
        Object.defineProperty(this, 'urlHelper', {value: url, enumerable:true, writable:false, configurable:false});
        Object.defineProperty(this, 'promiseHelper', {value: q, enumerable:true, writable:false, configurable:false});
    },
    handleRequest:function (req, res, next) {
        var serviceInstance = this.instanceFactory();

        var memberName = this.resolveMemberName(req, serviceInstance);
        var member = this.resolveMember(req, memberName);
        var memberInfo = this.createMemberContext(member, serviceInstance);
        var methodArgs = this.resolveArguments(req, serviceInstance, memberInfo);

        //this will be something much more dynamic


        var _v = memberInfo.invoke(methodArgs);


        var self = this;

        this.promiseHelper.when(_v).then(function (value) {
            var isXml = false;
            var responseType = "text/plain";
            if (value instanceof $data.XmlResult) {
                value = value.data;
                responseType = "text/xml";
            } else {
                responseType = "application/json";
                var builder = new $data.oDataServer.oDataResponseDataBuilder(
                    {
                        version:"V2",
                        context:self.type,
                        methodConfig:member,
                        methodName:memberName
                    }
                );
                value = builder.convertToResponse(value);
                value = JSON.stringify(value);
            }

            res.setHeader('Content-Type', responseType);
            res.end(value);

//            res.setHeader('Content-Type', responseType);
//
//           //if (value instanceof )
//
//           var translatedValue = (member.responseType === 'application/json' ? builder.convertToResponse(value) : value);
//           var formatter = responseFormatters[responseType];
//           res.end(formatter(translatedValue));
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
        if (prefixedMemberName in this.type.prototype) {
            return this.type.prototype[prefixedMemberName];
        } else {
            return this.type.prototype[memberName];
        }
        ;
    },
    createMemberContext:function (member, serviceInstance) {
        var self = this;

        var memberContext = {};

        var params = member.params || [];
        var paramBinders = [];


        for (var i = 0; i < params.length; i++) {
            var param = params[i];
            paramBinders.push(DefaultArgumentBinder.curry(null, param.name, {}))
        }

        memberContext.paramBinders = paramBinders;
        memberContext.resultType = member.resultType;
        memberContext.elementType = member.elementType;


        memberContext.invoke = function (args, request, response) {
            var executionContext = {
                request:request,
                response:response
            };

            Object.defineProperty(serviceInstance, "executionContext", {
                value:executionContext,
                enumerable:false,
                writable:false,
                configurable:false
            });


            var result = member.apply(serviceInstance, args);


            var defer = self.promiseHelper.defer();

            function success(r) {
                defer.resolve(r);
            }

            function error(r) {
                defer.reject(r);
            }

            if (typeof result === 'function') {
                result(success, error);
            } else {
                return self.promiseHelper.fcall(function () {
                    return result
                });
            }
            return defer.promise;
        }

        return memberContext;
    },
    resolveArguments:function (request, serviceInstance, memberContext) {

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
