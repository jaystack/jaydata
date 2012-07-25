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
function JSObjectAdapter(type, instanceFactory) {

    Object.defineProperty(this, "type", { value:type, enumerable:true, writable:false, configurable:false });
    Object.defineProperty(this, "instanceFactory", { value: instanceFactory, enumerable: true, writable:false, configurable:false });

    function handleRequest(req, res, next) {
        var serviceInstance = instanceFactory();

        var memberName = this.resolveMemberName(req, serviceInstance);
        var member     = this.resolveMember(req, memberName);
        var memberInfo = this.createMemberContext(member, serviceInstance);
        var methodArgs = this.resolveArguments(req, serviceInstance, memberInfo);

        //this will be something much more dynamic


        var _v = memberInfo.invoke(methodArgs);


        var self = this;

        q.when(_v).then(function (value) {
            var isXml = false;
            var responseType = "text/plain";
            if (value instanceof XmlResult) {
                value = value.data;
                responseType = "text/xml";
            } else {
                responseType = "application/json";
                var builder = new $data.oDataServer.oDataResponseDataBuilder(
                    {
                        version: "V2",
                        context: self.type,
                        methodConfig: member,
                        methodName: memberName
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
    }

    this.handleRequest = handleRequest;
}


Object.defineProperty(JSObjectAdapter.prototype, "type", { value: undefined, configurable:true });
Object.defineProperty(JSObjectAdapter.prototype, "instanceFactory", { value: undefined, configurable:true });

JSObjectAdapter.prototype.resolveMemberName = function(request, serviceInstance) {
    var parsedUrl = url.parse(request.url);
    //there will always be a leading '/'
    var pathElements = parsedUrl.pathname.split('/').slice(1);
    return pathElements[0];
};

JSObjectAdapter.prototype.resolveMember = function(request, memberName) {
    var prefixedMemberName = request.method + "_" + memberName;
    if (prefixedMemberName in this.type.prototype) {
        return this.type.prototype[prefixedMemberName];
    } else {
        return this.type.prototype[memberName];
    };
};



JSObjectAdapter.prototype.createMemberContext = function(member, serviceInstance) {
    var self = this;

    var memberContext = {};

    var params = member.params || [];
    var paramBinders = [];


    for(var i = 0; i < params.length; i++) {
        var param = params[i];
        paramBinders.push(DefaultArgumentBinder.curry(null, param.name, {}))
    }

    memberContext.paramBinders = paramBinders;
    memberContext.resultType = member.resultType;
    memberContext.elementType = member.elementType;


    memberContext.invoke = function(args, request, response) {
        var executionContext = {
            request: request,
            response: response
        };

        Object.defineProperty(serviceInstance, "executionContext", {
            value: executionContext,
            enumerable: false,
            writable: false,
            configurable: false
        });


        var result = member.apply(serviceInstance, args);


        var defer = q.defer();

        function success(r) {
            defer.resolve(r);
        }
        function error(r) {
            defer.reject(r);
        }

        if (typeof result === 'function') {
            result(success, error);
        } else {
            return q.fcall(function() { return result });
        }
        return defer.promise;
    }

    return memberContext;
}

JSObjectAdapter.prototype.resolveArguments = function(request, serviceInstance, memberContext) {

    var paramBinders = memberContext.paramBinders;
    var paramValues = [];
    for(var i = 0; i < paramBinders.length; i++) {
        var binder = paramBinders[i];
        var result = binder(request);
        paramValues.push(result);
    }
    return paramValues;
}
module.exports = JSObjectAdapter;