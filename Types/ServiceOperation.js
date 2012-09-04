Function.prototype.toServiceOperation = function(config){
    return new $data.FunctionImport(this, config);
};

$data.FunctionImport = function(fn, config){
    Object.defineProperty(this, 'asFunction', { value: fn });
    Object.getPrototypeOf(this).valueOf = function(){
        return this.asFunction;
    };
    Object.getPrototypeOf(this).toString = function(){
        return this.asFunction.toString();
    };
    Object.getPrototypeOf(this).call = function(){
        return this.asFunction.call.apply(arguments[0], Array.prototype.slice.call(arguments, 1));
    };
    Object.getPrototypeOf(this).apply = function(scope, args){
        return this.asFunction.apply(scope, args);
    };
    if (config) fn.extend(config);
};

$data.FunctionImport.prototype = {
    toServiceOperation: function(config){
        return new $data.FunctionImport(this.asFunction, config);
    },
    extend: function(extend){
        for (var i in extend){
            this[i] = extend[i];
        }
        
        return this;
    },
    chain: function(before, after){
        var fn = this;
        
        var ret = function(){
            var chain = arguments.callee.chainFn;
            var args = [];
            if (arguments.length){
                for (var i = 0; i < arguments.length; i++){
                    args.push(arguments[i]);
                }
            }
            var argsCount = args.length;
            var i = 0;
            
            var readyFn = function(){
                if (args[args.length - 1] && args[args.length - 1].success && typeof args[args.length - 1].success === 'function'){
                    var fn = args[args.length - 1].success;
                    fn.apply(this, arguments);
                }else return arguments.length ? arguments[0] : undefined;
            };
            
            var callbackFn = function(){
                var fn = chain[i];
                i++;
                
                var r = fn.apply(this, args);
                if (typeof r === 'function'){
                    var argsFn = arguments;
                    args[argsCount] = (i < chain.length ? (function(){ return callbackFn.apply(this, argsFn); }) : (function(){ return readyFn.apply(this, argsFn); }));
                    r.apply(this, args);
                }else{
                    if (i < chain.length){
                        callbackFn.apply(this, arguments);
                    }else readyFn(this, arguments);
                }
            }
            
            callbackFn();
        };
        
        if (!ret.chainFn) ret.chainFn = (before || []).concat([fn].concat(after || []));
        
        return ret;
    },
    before: function(on){
        var ret = this;
        
        if (!this.chainFn) ret = ret.chain();
        ret.chainFn.unshift(on);
            
        return ret;
    },
    after: function(on){
        var ret = this;
        
        if (!this.chainFn) ret = ret.chain();
        ret.chainFn.push(on);
            
        return ret;
    },
    asResult: function(type, config){
        return this.extend({
            resultType: type,
            resultCfg: config
        });
    },
    returns: function(type, elementType){
        if (typeof type === 'string')
            type = Container.resolveType(type);
            
        if (typeof elementType === 'string')
            elementType = Container.resolveType(elementType);

        return this.extend({
            returnType: type,
            elementType: elementType
        });
    },
    params: function(params){
        /*for (var p in params){
            if (typeof params[p] === 'string')
                params[p] = Container.resolveType(params[p]);
        }*/
        
        return this.extend({
            params: params
        });
    },
    serviceName: function(serviceName){
        return this.extend({
            serviceName: serviceName
        });
    },
    httpMethod: function(method){
        return this.extend({
            method: method
        });
    },
    webGet: function(){
        return this.httpMethod('GET');
    },
    webInvoke: function(){
        return this.httpMethod('POST');
    },
    authorize: function(roles, callback){
        var r = {};
        if (roles instanceof Array){
            for (var i = 0; i < roles.length; i++){
                if (typeof roles[i] === 'string') r[roles[i]] = true;
            }
        }else r = roles;
        
        this.roles = r;

        var fn = this;
        
        ret = function(){
            var pHandler = new $data.PromiseHandler();
            var clbWrapper = pHandler.createCallback(callback);
            var pHandlerResult = pHandler.getPromise();
            var args = arguments;
            
            clbWrapper.success = clbWrapper.success.after(function(){
                fn.apply(this, args);
            });
            
            $data.Access.isAuthorized($data.Access.Execute, this.user, fn.roles, clbWrapper);
            
            return pHandlerResult;
        };
        
        return ret;
    },
    toPromise: function(callback){
        var fn = this;
        
        var ret = function(){
            var pHandler = new $data.PromiseHandler();
            var clbWrapper = pHandler.createCallback(callback);
            var pHandlerResult = pHandler.getPromise();
            
            arguments[arguments.length++] = clbWrapper;
            fn.apply(this, arguments);
            
            return pHandlerResult;
        };
        
        return this;
    }
};

$data.ServiceOperation = (function(){
    var fn = arguments.callee;
    
    var virtualEntitySet = fn.elementType ? this.getEntitySetFromElementType(Container.resolveType(fn.elementType)) : null;
    
    var paramConstExpression = null;
    if (fn.params) {
        paramConstExpression = [];
        for (var i = 0; i < fn.params.length; i++) {
            //TODO: check params type
            for (var name in fn.params[i]) {
                paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(fn.params[i][name]), name));
            }
        }
    }

    var ec = Container.createEntityContextExpression(this);
    var memberdef = this.getType().getMemberDefinition(fn.serviceName);
    var es = Container.createServiceOperationExpression(ec,
            Container.createMemberInfoExpression(memberdef),
            paramConstExpression,
            fn);

    //Get callback function
    var clb = arguments[arguments.length - 1];
    if (typeof clb !== 'function') {
        clb = undefined;
    }

    if (virtualEntitySet) {
        var q = Container.createQueryable(virtualEntitySet, es);
        if (clb) {
            es.isTerminated = true;
            return q._runQuery(clb);
        }
        return q;
    }
    else {
        var returnType = Container.resolveType(fn.returnType);

        var q = Container.createQueryable(this, es);
        q.defaultType = returnType;

        if (returnType === $data.Queryable) {
            q.defaultType = Container.resolveType(fn.elementType);
            if (clb) {
                es.isTerminated = true;
                return q._runQuery(clb);
            }
            return q;
        }
        es.isTerminated = true;
        return q._runQuery(clb);
    }
});
